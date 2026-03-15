import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:logging/logging.dart';
import 'package:openclaw_client/core/models/ipc_models.dart';
import 'package:openclaw_client/core/constants/app_constants.dart';
import 'package:openclaw_client/services/platform/platform_service.dart';

/// IPC 客户端服务 - 用于与本地 Gateway 进程通信
class IpcService {
  static final IpcService instance = IpcService._();
  IpcService._();

  final _log = Logger('IpcService');
  Socket? _socket;
  bool _isConnected = false;
  final _responseController = StreamController<IpcResponse>.broadcast();

  Stream<IpcResponse> get responses => _responseController.stream;
  bool get isConnected => _isConnected;

  /// 连接到 IPC Socket
  Future<bool> connect() async {
    if (_isConnected) return true;

    final socketPath = AppConstants.controlSocketPath;
    if (socketPath.isEmpty) {
      _log.warning('IPC socket path not available on this platform');
      return false;
    }

    try {
      final platform = PlatformService.instance;
      
      if (platform.isMacOS || platform.isLinux) {
        // Unix Domain Socket
        final file = File(socketPath);
        if (!await file.exists()) {
          _log.warning('IPC socket not found: $socketPath');
          return false;
        }
        _socket = await InternetAddress(socketPath, type: InternetAddressType.unix)
            .then((addr) => Socket.connect(addr.host, 0));
      } else if (platform.isWindows) {
        // Named Pipe (Windows)
        // Flutter doesn't support named pipes directly, use alternative approach
        _log.warning('Windows named pipe IPC not yet implemented');
        return false;
      }

      _isConnected = true;
      _socket!.listen(
        _handleData,
        onError: _handleError,
        onDone: _handleDone,
      );

      _log.info('IPC connected');
      return true;
    } catch (e) {
      _log.severe('IPC connection failed: $e');
      _isConnected = false;
      return false;
    }
  }

  /// 断开连接
  Future<void> disconnect() async {
    if (!_isConnected) return;
    
    await _socket?.close();
    _socket = null;
    _isConnected = false;
    _log.info('IPC disconnected');
  }

  /// 发送请求
  Future<IpcResponse> sendRequest(IpcRequest request) async {
    if (!_isConnected) {
      throw StateError('IPC not connected');
    }

    final json = request.toJson();
    final message = jsonEncode(json) + '\n';

    _socket!.write(message);
    await _socket!.flush();

    // 等待响应
    return await responses.firstWhere(
      (r) => true, // 简化：返回第一个响应
      orElse: () => const IpcResponse.error(message: 'No response'),
    );
  }

  /// 获取状态
  Future<IpcResponse> getStatus() async {
    return await sendRequest(const IpcRequest.status());
  }

  /// 发送通知
  Future<IpcResponse> notify({
    required String title,
    required String body,
    String? sound,
  }) async {
    return await sendRequest(IpcRequest.notify(
      title: title,
      body: body,
      sound: sound,
    ));
  }

  /// 确保权限
  Future<IpcResponse> ensurePermissions(
    List<CapabilityType> capabilities, {
    bool interactive = false,
  }) async {
    return await sendRequest(IpcRequest.ensurePermissions(
      capabilities: capabilities,
      interactive: interactive,
    ));
  }

  void _handleData(List<int> data) {
    try {
      final message = utf8.decode(data);
      final json = jsonDecode(message) as Map<String, dynamic>;
      final response = IpcResponse.fromJson(json);
      _responseController.add(response);
    } catch (e) {
      _log.warning('Failed to parse IPC response: $e');
    }
  }

  void _handleError(dynamic error) {
    _log.severe('IPC error: $error');
    _isConnected = false;
  }

  void _handleDone() {
    _log.info('IPC connection closed');
    _isConnected = false;
  }

  void dispose() {
    disconnect();
    _responseController.close();
  }
}
