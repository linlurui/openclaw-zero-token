import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logging/logging.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'package:openclaw_client/core/models/gateway_models.dart';
import 'package:openclaw_client/services/platform/platform_service.dart';
import 'package:openclaw_client/core/constants/app_constants.dart';

/// Gateway 连接状态 Provider
final gatewayConnectionProvider =
    StateNotifierProvider<GatewayConnectionNotifier, GatewayConnectionState>(
  (ref) => GatewayConnectionNotifier(),
);

/// 发现到的 Gateway 列表 Provider
final discoveredGatewaysProvider =
    StateNotifierProvider<DiscoveredGatewaysNotifier, List<DiscoveredGateway>>(
  (ref) => DiscoveredGatewaysNotifier(),
);

/// Gateway 连接管理器
class GatewayConnectionNotifier extends StateNotifier<GatewayConnectionState> {
  GatewayConnectionNotifier() : super(GatewayConnectionState.disconnected);

  final _log = Logger('GatewayConnection');
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  String? _serverId;
  Timer? _heartbeatTimer;

  String? get serverId => _serverId;
  bool get isConnected => state == GatewayConnectionState.connected;

  /// 连接到 Gateway
  Future<bool> connect(GatewayConfig config) async {
    if (state == GatewayConnectionState.connected) {
      await disconnect();
    }

    state = GatewayConnectionState.connecting;

    try {
      final protocol = config.useTLS ? 'wss' : 'ws';
      final url = '$protocol://${config.host}:${config.port}';

      _log.info('Connecting to Gateway: $url');
      _channel = WebSocketChannel.connect(Uri.parse(url));

      state = GatewayConnectionState.authenticating;

      // 发送连接请求
      final connectRequest = ConnectRequest(
        protocolVersion: AppConstants.gatewayProtocolVersion,
        clientId: _generateClientId(),
        clientVersion: AppConstants.appVersion,
        platform: PlatformService.instance.platformName,
      );

      _sendMessage({'type': 'connect', 'payload': connectRequest.toJson()});

      // 监听响应
      final completer = Completer<bool>();
      
      _subscription = _channel!.stream.listen(
        (data) => _handleMessage(data, completer, config),
        onError: (error) => _handleError(error, completer),
        onDone: () => _handleDone(completer),
      );

      // 等待连接响应
      final connected = await completer.future.timeout(
        AppConstants.connectionTimeout,
        onTimeout: () => false,
      );

      if (connected) {
        state = GatewayConnectionState.connected;
        _startHeartbeat();
        _log.info('Gateway connected');
        return true;
      } else {
        state = GatewayConnectionState.error;
        await disconnect();
        return false;
      }
    } catch (e) {
      _log.severe('Gateway connection failed: $e');
      state = GatewayConnectionState.error;
      await disconnect();
      return false;
    }
  }

  /// 断开连接
  Future<void> disconnect() async {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
    
    await _subscription?.cancel();
    _subscription = null;
    
    await _channel?.sink.close();
    _channel = null;
    
    _serverId = null;
    state = GatewayConnectionState.disconnected;
    _log.info('Gateway disconnected');
  }

  /// 发送事件
  void sendEvent(GatewayEvent event) {
    if (!isConnected) {
      _log.warning('Cannot send event: not connected');
      return;
    }
    _sendMessage(event.toJson());
  }

  void _sendMessage(Map<String, dynamic> message) {
    _channel?.sink.add(jsonEncode(message));
  }

  void _handleMessage(
    dynamic data,
    Completer<bool> completer,
    GatewayConfig config,
  ) {
    try {
      final json = jsonDecode(data as String) as Map<String, dynamic>;
      final type = json['type'] as String?;
      final payload = json['payload'] as Map<String, dynamic>? ?? {};

      _log.fine('Received: $type');

      switch (type) {
        case 'connect.challenge':
          _handleChallenge(payload, config, completer);
          break;
        case 'hello.ok':
          _handleHelloOk(payload, completer);
          break;
        case 'connect.error':
          _handleConnectError(payload, completer);
          break;
        default:
          // 其他事件通过 stream 广播
          _log.fine('Unhandled event type: $type');
      }
    } catch (e) {
      _log.warning('Failed to parse message: $e');
    }
  }

  void _handleChallenge(
    Map<String, dynamic> payload,
    GatewayConfig config,
    Completer<bool> completer,
  ) {
    final nonce = payload['nonce'] as String?;
    if (nonce == null) return;

    // 发送设备身份
    _sendMessage({
      'type': 'device.identity',
      'payload': {
        'nonce': nonce,
        'token': config.token ?? '',
        'deviceId': _generateDeviceId(),
      },
    });
  }

  void _handleHelloOk(
    Map<String, dynamic> payload,
    Completer<bool> completer,
  ) {
    _serverId = payload['serverId'] as String?;
    if (!completer.isCompleted) {
      completer.complete(true);
    }
  }

  void _handleConnectError(
    Map<String, dynamic> payload,
    Completer<bool> completer,
  ) {
    final message = payload['message'] as String? ?? 'Unknown error';
    _log.severe('Connect error: $message');
    if (!completer.isCompleted) {
      completer.complete(false);
    }
  }

  void _handleError(dynamic error, Completer<bool> completer) {
    _log.severe('WebSocket error: $error');
    state = GatewayConnectionState.error;
    if (!completer.isCompleted) {
      completer.complete(false);
    }
  }

  void _handleDone(Completer<bool> completer) {
    _log.info('WebSocket closed');
    if (state == GatewayConnectionState.connected) {
      state = GatewayConnectionState.disconnected;
    }
    if (!completer.isCompleted) {
      completer.complete(false);
    }
  }

  void _startHeartbeat() {
    _heartbeatTimer = Timer.periodic(
      AppConstants.heartbeatInterval,
      (_) => _sendMessage({'type': 'ping'}),
    );
  }

  String _generateClientId() {
    return 'flutter-${DateTime.now().millisecondsSinceEpoch}';
  }

  String _generateDeviceId() {
    // TODO: 从本地存储获取或生成设备 ID
    return 'device-${DateTime.now().millisecondsSinceEpoch}';
  }
}

/// Gateway 发现服务
class DiscoveredGatewaysNotifier extends StateNotifier<List<DiscoveredGateway>> {
  DiscoveredGatewaysNotifier() : super([]);

  final _log = Logger('GatewayDiscovery');

  /// 开始发现
  Future<void> startDiscovery() async {
    _log.info('Starting gateway discovery...');
    
    // 添加本地 Gateway（如果存在）
    final localGateway = DiscoveredGateway(
      id: 'local',
      displayName: 'Local Gateway',
      host: '127.0.0.1',
      gatewayPort: AppConstants.gatewayDefaultPort,
      stableId: 'local-gateway',
      isLocal: true,
    );
    
    state = [localGateway];

    // TODO: 实现 mDNS/Bonjour 发现
    // TODO: 实现 Tailscale 发现
  }

  /// 停止发现
  void stopDiscovery() {
    _log.info('Stopping gateway discovery');
  }

  /// 手动添加 Gateway
  void addGateway(DiscoveredGateway gateway) {
    state = [...state, gateway];
  }

  /// 移除 Gateway
  void removeGateway(String id) {
    state = state.where((g) => g.id != id).toList();
  }
}

/// Gateway 连接状态扩展
extension GatewayModelsExtension on GatewayConfig {
  String get host {
    return this.host;
  }
}
