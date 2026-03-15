import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:openclaw_client/services/gateway/gateway_service.dart';

/// 连接状态显示组件
class ConnectionStatusWidget extends ConsumerWidget {
  final bool showDetails;

  const ConnectionStatusWidget({
    super.key,
    this.showDetails = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectionState = ref.watch(gatewayConnectionProvider);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _getBackgroundColor(context, connectionState),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _buildStatusIcon(connectionState),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _getStatusText(connectionState),
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: _getTextColor(context, connectionState),
                      ),
                ),
                if (showDetails) ...[
                  const SizedBox(height: 2),
                  Text(
                    _getStatusDescription(connectionState),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: _getTextColor(context, connectionState)?.withOpacity(0.8),
                        ),
                  ),
                ],
              ],
            ),
          ),
          if (connectionState == GatewayConnectionState.connecting ||
              connectionState == GatewayConnectionState.authenticating ||
              connectionState == GatewayConnectionState.reconnecting)
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: _getTextColor(context, connectionState),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatusIcon(GatewayConnectionState state) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        shape: BoxShape.circle,
      ),
      child: Icon(
        _getIcon(state),
        size: 16,
        color: Colors.white,
      ),
    );
  }

  IconData _getIcon(GatewayConnectionState state) {
    switch (state) {
      case GatewayConnectionState.connected:
        return Icons.link;
      case GatewayConnectionState.connecting:
      case GatewayConnectionState.authenticating:
        return Icons.sync;
      case GatewayConnectionState.reconnecting:
        return Icons.refresh;
      case GatewayConnectionState.error:
        return Icons.error_outline;
      case GatewayConnectionState.disconnected:
        return Icons.link_off;
    }
  }

  String _getStatusText(GatewayConnectionState state) {
    switch (state) {
      case GatewayConnectionState.connected:
        return '已连接';
      case GatewayConnectionState.connecting:
        return '连接中...';
      case GatewayConnectionState.authenticating:
        return '认证中...';
      case GatewayConnectionState.reconnecting:
        return '重新连接...';
      case GatewayConnectionState.error:
        return '连接错误';
      case GatewayConnectionState.disconnected:
        return '未连接';
    }
  }

  String _getStatusDescription(GatewayConnectionState state) {
    switch (state) {
      case GatewayConnectionState.connected:
        return 'Gateway 已就绪，可以开始使用';
      case GatewayConnectionState.connecting:
        return '正在建立 WebSocket 连接';
      case GatewayConnectionState.authenticating:
        return '正在进行身份验证';
      case GatewayConnectionState.reconnecting:
        return '连接已断开，正在尝试重新连接';
      case GatewayConnectionState.error:
        return '连接失败，请检查 Gateway 是否运行';
      case GatewayConnectionState.disconnected:
        return '点击下方发现的 Gateway 进行连接';
    }
  }

  Color? _getBackgroundColor(BuildContext context, GatewayConnectionState state) {
    switch (state) {
      case GatewayConnectionState.connected:
        return const Color(0xFF10B981); // Green
      case GatewayConnectionState.connecting:
      case GatewayConnectionState.authenticating:
        return const Color(0xFF3B82F6); // Blue
      case GatewayConnectionState.reconnecting:
        return const Color(0xFFF59E0B); // Yellow
      case GatewayConnectionState.error:
        return const Color(0xFFEF4444); // Red
      case GatewayConnectionState.disconnected:
        return Theme.of(context).colorScheme.surfaceContainerHighest;
    }
  }

  Color? _getTextColor(BuildContext context, GatewayConnectionState state) {
    if (state == GatewayConnectionState.disconnected) {
      return Theme.of(context).colorScheme.onSurface;
    }
    return Colors.white;
  }
}
