import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';

import 'package:openclaw_client/services/gateway/gateway_service.dart';
import 'package:openclaw_client/services/platform/platform_service.dart';
import 'package:openclaw_client/ui/screens/discovery_screen.dart';
import 'package:openclaw_client/ui/screens/chat_screen.dart';
import 'package:openclaw_client/ui/screens/settings_screen.dart';
import 'package:openclaw_client/ui/screens/capabilities_screen.dart';
import 'package:openclaw_client/ui/screens/skills_screen.dart';
import 'package:openclaw_client/ui/widgets/connection_status_widget.dart';
import 'package:openclaw_client/ui/widgets/adaptive_scaffold.dart';

/// 主屏幕
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _selectedIndex = 0;
  final _platformService = PlatformService.instance;

  @override
  Widget build(BuildContext context) {
    final connectionState = ref.watch(gatewayConnectionProvider);
    final isDesktop = _platformService.isDesktop;

    // 桌面端使用自适应布局
    if (isDesktop) {
      return _buildDesktopLayout(context, connectionState);
    }

    // 移动端使用底部导航
    return _buildMobileLayout(context, connectionState);
  }

  Widget _buildDesktopLayout(BuildContext context, GatewayConnectionState state) {
    return AdaptiveScaffold(
      title: _getTitle(),
      selectedIndex: _selectedIndex,
      onDestinationSelected: (index) {
        setState(() => _selectedIndex = index);
      },
      header: const ConnectionStatusWidget(),
      body: _getBody(),
    );
  }

  Widget _buildMobileLayout(BuildContext context, GatewayConnectionState state) {
    return Scaffold(
      body: _getBody(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '首页',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble),
            label: '聊天',
          ),
          NavigationDestination(
            icon: Icon(Icons.security_outlined),
            selectedIcon: Icon(Icons.security),
            label: '权限',
          ),
          NavigationDestination(
            icon: Icon(Icons.extension_outlined),
            selectedIcon: Icon(Icons.extension),
            label: '技能',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: '设置',
          ),
        ],
      ),
    );
  }

  String _getTitle() {
    switch (_selectedIndex) {
      case 0:
        return 'OpenClaw';
      case 1:
        return '聊天';
      case 2:
        return '权限管理';
      case 3:
        return '技能';
      case 4:
        return '设置';
      default:
        return 'OpenClaw';
    }
  }

  Widget _getBody() {
    return AnimatedSwitcher(
      duration: 200.ms,
      child: _getScreen(),
    );
  }

  Widget _getScreen() {
    switch (_selectedIndex) {
      case 0:
        return const DiscoveryScreen();
      case 1:
        return const ChatScreen();
      case 2:
        return const CapabilitiesScreen();
      case 3:
        return const SkillsScreen();
      case 4:
        return const SettingsScreen();
      default:
        return const DiscoveryScreen();
    }
  }
}
