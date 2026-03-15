import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:window_manager/window_manager.dart';

import 'core/constants/app_constants.dart';
import 'ui/theme/app_theme.dart';
import 'ui/screens/home_screen.dart';
import 'services/platform/platform_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 初始化平台服务
  await PlatformService.instance.initialize();

  // 配置窗口管理器（桌面端）
  if (PlatformService.instance.isDesktop) {
    await windowManager.ensureInitialized();
    const windowOptions = WindowOptions(
      size: Size(400, 600),
      minimumSize: Size(350, 500),
      center: true,
      backgroundColor: Colors.transparent,
      skipTaskbar: PlatformService.instance.isMacOS,
      titleBarStyle: TitleBarStyle.hidden,
    );
    await windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.show();
      await windowManager.focus();
    });
  }

  // 设置状态栏样式
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(
    const ProviderScope(
      child: OpenClawApp(),
    ),
  );
}

class OpenClawApp extends ConsumerWidget {
  const OpenClawApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
