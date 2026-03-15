import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:openclaw_client/core/models/capability.dart';
import 'package:openclaw_client/services/platform/platform_service.dart';

/// 权限管理屏幕
class CapabilitiesScreen extends ConsumerStatefulWidget {
  const CapabilitiesScreen({super.key});

  @override
  ConsumerState<CapabilitiesScreen> createState() => _CapabilitiesScreenState();
}

class _CapabilitiesScreenState extends ConsumerState<CapabilitiesScreen> {
  final _platformService = PlatformService.instance;
  Map<CapabilityType, PermissionStatus> _statuses = {};

  @override
  void initState() {
    super.initState();
    _checkAllPermissions();
  }

  Future<void> _checkAllPermissions() async {
    final statuses = <CapabilityType, PermissionStatus>{};

    for (final capability in CapabilityType.values) {
      final permission = _getPermission(capability);
      if (permission != null) {
        statuses[capability] = await permission.status;
      }
    }

    setState(() => _statuses = statuses);
  }

  Future<void> _requestPermission(CapabilityType capability) async {
    final permission = _getPermission(capability);
    if (permission == null) return;

    final status = await permission.request();
    setState(() => _statuses[capability] = status);
  }

  Permission? _getPermission(CapabilityType capability) {
    switch (capability) {
      case CapabilityType.camera:
        return Permission.camera;
      case CapabilityType.microphone:
        return Permission.microphone;
      case CapabilityType.speechRecognition:
        return Permission.speech;
      case CapabilityType.location:
        return Permission.location;
      case CapabilityType.notifications:
        return Permission.notification;
      default:
        return null;
    }
  }

  IconData _getIcon(CapabilityType capability) {
    switch (capability) {
      case CapabilityType.camera:
        return Icons.camera_alt;
      case CapabilityType.microphone:
        return Icons.mic;
      case CapabilityType.speechRecognition:
        return Icons.record_voice_over;
      case CapabilityType.location:
        return Icons.location_on;
      case CapabilityType.notifications:
        return Icons.notifications;
      case CapabilityType.screenRecording:
        return Icons.screen_share;
      case CapabilityType.accessibility:
        return Icons.accessibility;
      case CapabilityType.appleScript:
        return Icons.terminal;
      case CapabilityType.sms:
        return Icons.sms;
      case CapabilityType.phone:
        return Icons.phone;
    }
  }

  String _getDescription(CapabilityType capability) {
    switch (capability) {
      case CapabilityType.camera:
        return '允许应用访问相机进行拍照和视频录制';
      case CapabilityType.microphone:
        return '允许应用使用麦克风进行音频录制';
      case CapabilityType.speechRecognition:
        return '允许应用进行语音识别';
      case CapabilityType.location:
        return '允许应用获取设备位置信息';
      case CapabilityType.notifications:
        return '允许应用发送系统通知';
      case CapabilityType.screenRecording:
        return '允许应用录制屏幕内容';
      case CapabilityType.accessibility:
        return '允许应用使用辅助功能进行 UI 自动化';
      case CapabilityType.appleScript:
        return '允许应用执行 AppleScript 脚本';
      case CapabilityType.sms:
        return '允许应用发送和读取短信';
      case CapabilityType.phone:
        return '允许应用拨打电话';
    }
  }

  bool _isAvailableOnPlatform(CapabilityType capability) {
    final isDesktop = _platformService.isDesktop;
    final isMobile = _platformService.isMobile;

    switch (capability) {
      case CapabilityType.appleScript:
        return _platformService.isMacOS;
      case CapabilityType.screenRecording:
        return isDesktop;
      case CapabilityType.sms:
      case CapabilityType.phone:
        return isMobile && _platformService.isAndroid;
      default:
        return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: CapabilityType.values.length,
        itemBuilder: (context, index) {
          final capability = CapabilityType.values[index];
          final status = _statuses[capability];
          final isAvailable = _isAvailableOnPlatform(capability);

          return _CapabilityCard(
            capability: capability,
            status: status,
            isAvailable: isAvailable,
            icon: _getIcon(capability),
            description: _getDescription(capability),
            onRequest: () => _requestPermission(capability),
          );
        },
      ),
    );
  }
}

class _CapabilityCard extends StatelessWidget {
  final CapabilityType capability;
  final PermissionStatus? status;
  final bool isAvailable;
  final IconData icon;
  final String description;
  final VoidCallback onRequest;

  const _CapabilityCard({
    required this.capability,
    required this.status,
    required this.isAvailable,
    required this.icon,
    required this.description,
    required this.onRequest,
  });

  @override
  Widget build(BuildContext context) {
    final isGranted = status?.isGranted ?? false;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: Theme.of(context).colorScheme.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _capitalize(capability.name),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
                if (!isAvailable)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '不可用',
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                  )
                else if (isGranted)
                  Icon(
                    Icons.check_circle,
                    color: Theme.of(context).colorScheme.primary,
                  )
                else
                  TextButton(
                    onPressed: onRequest,
                    child: const Text('授权'),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }
}
