import 'package:flutter/material.dart';

/// 自适应 Scaffold - 桌面端使用侧边栏，移动端使用底部导航
class AdaptiveScaffold extends StatefulWidget {
  final String title;
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget? header;
  final Widget body;
  final List<NavigationDestination>? destinations;

  const AdaptiveScaffold({
    super.key,
    required this.title,
    required this.selectedIndex,
    required this.onDestinationSelected,
    this.header,
    required this.body,
    this.destinations,
  });

  @override
  State<AdaptiveScaffold> createState() => _AdaptiveScaffoldState();
}

class _AdaptiveScaffoldState extends State<AdaptiveScaffold> {
  final List<NavigationDestination> _defaultDestinations = const [
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
      icon: Icon(Icons.settings_outlined),
      selectedIcon: Icon(Icons.settings),
      label: '设置',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final destinations = widget.destinations ?? _defaultDestinations;
    final screenWidth = MediaQuery.of(context).size.width;
    final useRail = screenWidth > 600;

    if (useRail) {
      return _buildRailLayout(context, destinations);
    }
    return _buildBottomNavLayout(context, destinations);
  }

  Widget _buildRailLayout(
    BuildContext context,
    List<NavigationDestination> destinations,
  ) {
    return Scaffold(
      body: Row(
        children: [
          // Navigation Rail
          NavigationRail(
            selectedIndex: widget.selectedIndex,
            onDestinationSelected: widget.onDestinationSelected,
            labelType: NavigationRailLabelType.all,
            leading: Column(
              children: [
                const SizedBox(height: 8),
                // 应用图标
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Theme.of(context).colorScheme.primary,
                        Theme.of(context).colorScheme.secondary,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.auto_awesome,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ],
            ),
            destinations: destinations
                .map((d) => NavigationRailDestination(
                      icon: d.icon,
                      selectedIcon: d.selectedIcon,
                      label: Text(d.label),
                    ))
                .toList(),
          ),
          const VerticalDivider(thickness: 1, width: 1),

          // 内容区域
          Expanded(
            child: Column(
              children: [
                // 标题栏
                Container(
                  height: 52,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Text(
                        widget.title,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      const Spacer(),
                      // 窗口控制按钮（仅 macOS）
                      if (Theme.of(context).platform == TargetPlatform.macOS) ...[
                        _WindowControls(),
                      ],
                    ],
                  ),
                ),
                if (widget.header != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: widget.header,
                  ),
                // 主体内容
                Expanded(child: widget.body),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavLayout(
    BuildContext context,
    List<NavigationDestination> destinations,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Column(
        children: [
          if (widget.header != null) widget.header!,
          Expanded(child: widget.body),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: widget.selectedIndex,
        onDestinationSelected: widget.onDestinationSelected,
        destinations: destinations,
      ),
    );
  }
}

/// macOS 风格窗口控制按钮
class _WindowControls extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _WindowButton(
          color: const Color(0xFFFF5F56),
          onTap: () {
            // 关闭窗口
          },
        ),
        const SizedBox(width: 8),
        _WindowButton(
          color: const Color(0xFFFFBD2E),
          onTap: () {
            // 最小化窗口
          },
        ),
        const SizedBox(width: 8),
        _WindowButton(
          color: const Color(0xFF27C93F),
          onTap: () {
            // 最大化窗口
          },
        ),
      ],
    );
  }
}

class _WindowButton extends StatelessWidget {
  final Color color;
  final VoidCallback onTap;

  const _WindowButton({
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
