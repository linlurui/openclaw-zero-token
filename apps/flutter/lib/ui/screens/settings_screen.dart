import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:openclaw_client/services/platform/platform_service.dart';
import 'package:openclaw_client/services/gateway/gateway_service.dart';

/// 设置屏幕
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _platformService = PlatformService.instance;
  bool _notificationsEnabled = true;
  bool _darkMode = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 设备信息卡片
          _DeviceInfoCard(),
          const SizedBox(height: 16),

          // 连接设置
          _SettingsSection(
            title: '连接',
            children: [
              _SettingsTile(
                icon: Icons.dns,
                title: 'Gateway 配置',
                subtitle: '配置默认 Gateway 地址',
                onTap: () => _showGatewayConfig(context),
              ),
              _SettingsTile(
                icon: Icons.devices,
                title: '设备管理',
                subtitle: '管理已配对的设备',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 外观设置
          _SettingsSection(
            title: '外观',
            children: [
              _SettingsSwitch(
                icon: Icons.dark_mode,
                title: '深色模式',
                subtitle: '使用深色主题',
                value: _darkMode,
                onChanged: (value) {
                  setState(() => _darkMode = value);
                },
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 通知设置
          _SettingsSection(
            title: '通知',
            children: [
              _SettingsSwitch(
                icon: Icons.notifications,
                title: '推送通知',
                subtitle: '接收消息和状态通知',
                value: _notificationsEnabled,
                onChanged: (value) {
                  setState(() => _notificationsEnabled = value);
                },
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 关于
          _SettingsSection(
            title: '关于',
            children: [
              _SettingsTile(
                icon: Icons.info,
                title: '版本',
                subtitle: '${_platformService.appVersion}',
              ),
              _SettingsTile(
                icon: Icons.code,
                title: '开源协议',
                onTap: () => _showLicenses(context),
              ),
              _SettingsTile(
                icon: Icons.help,
                title: '帮助与反馈',
                onTap: () {},
              ),
            ],
          ),

          const SizedBox(height: 32),

          // 断开连接按钮
          if (ref.watch(gatewayConnectionProvider) == GatewayConnectionState.connected)
            FilledButton.tonalIcon(
              onPressed: _disconnect,
              icon: const Icon(Icons.link_off),
              label: const Text('断开 Gateway 连接'),
            ),
        ],
      ),
    );
  }

  void _showGatewayConfig(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Gateway 配置'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: 'Gateway 地址',
                hintText: '127.0.0.1',
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: '端口',
                hintText: '3001',
              ),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('保存'),
          ),
        ],
      ),
    );
  }

  void _showLicenses(BuildContext context) {
    showLicensePage(
      context: context,
      applicationName: 'OpenClaw',
      applicationVersion: _platformService.appVersion,
    );
  }

  void _disconnect() async {
    await ref.read(gatewayConnectionProvider.notifier).disconnect();
  }
}

/// 设备信息卡片
class _DeviceInfoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final platform = PlatformService.instance;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    platform.isDesktop ? Icons.computer : Icons.phone_android,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        platform.deviceName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      Text(
                        platform.osVersion,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _InfoRow(label: '设备 ID', value: platform.deviceId.substring(0, 16) + '...'),
            _InfoRow(label: '应用版本', value: platform.appVersion),
            _InfoRow(label: '平台', value: platform.platformName.toUpperCase()),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
        ],
      ),
    );
  }
}

/// 设置分组
class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SettingsSection({
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
        Card(
          margin: EdgeInsets.zero,
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }
}

/// 设置项
class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: onTap != null ? const Icon(Icons.chevron_right) : null,
      onTap: onTap,
    );
  }
}

/// 设置开关
class _SettingsSwitch extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SettingsSwitch({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
      ),
    );
  }
}
