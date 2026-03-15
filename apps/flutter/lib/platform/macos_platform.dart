import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

/// macOS 平台特定功能实现
class MacOSPlatform {
  static const _channel = MethodChannel('ai.openclaw/macOS');

  /// 显示菜单栏图标
  static Future<void> showMenuBarIcon() async {
    try {
      await _channel.invokeMethod('showMenuBarIcon');
    } on PlatformException catch (e) {
      debugPrint('Failed to show menu bar icon: ${e.message}');
    }
  }

  /// 隐藏菜单栏图标
  static Future<void> hideMenuBarIcon() async {
    try {
      await _channel.invokeMethod('hideMenuBarIcon');
    } on PlatformException catch (e) {
      debugPrint('Failed to hide menu bar icon: ${e.message}');
    }
  }

  /// 设置菜单栏标题
  static Future<void> setMenuBarTitle(String title) async {
    try {
      await _channel.invokeMethod('setMenuBarTitle', {'title': title});
    } on PlatformException catch (e) {
      debugPrint('Failed to set menu bar title: ${e.message}');
    }
  }

  /// 显示菜单栏菜单
  static Future<void> showMenuBarMenu(List<MenuItem> items) async {
    try {
      await _channel.invokeMethod('showMenuBarMenu', {
        'items': items.map((i) => i.toMap()).toList(),
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to show menu bar menu: ${e.message}');
    }
  }

  /// 执行 AppleScript
  static Future<String?> runAppleScript(String script) async {
    try {
      return await _channel.invokeMethod('runAppleScript', {'script': script});
    } on PlatformException catch (e) {
      debugPrint('Failed to run AppleScript: ${e.message}');
      return null;
    }
  }

  /// 检查辅助功能权限
  static Future<bool> checkAccessibilityPermission() async {
    try {
      return await _channel.invokeMethod('checkAccessibilityPermission') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to check accessibility permission: ${e.message}');
      return false;
    }
  }

  /// 请求辅助功能权限
  static Future<void> requestAccessibilityPermission() async {
    try {
      await _channel.invokeMethod('requestAccessibilityPermission');
    } on PlatformException catch (e) {
      debugPrint('Failed to request accessibility permission: ${e.message}');
    }
  }

  /// 开始屏幕录制
  static Future<void> startScreenRecording({
    int? displayId,
    int fps = 30,
    bool includeAudio = false,
  }) async {
    try {
      await _channel.invokeMethod('startScreenRecording', {
        'displayId': displayId,
        'fps': fps,
        'includeAudio': includeAudio,
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to start screen recording: ${e.message}');
    }
  }

  /// 停止屏幕录制
  static Future<String?> stopScreenRecording() async {
    try {
      return await _channel.invokeMethod('stopScreenRecording');
    } on PlatformException catch (e) {
      debugPrint('Failed to stop screen recording: ${e.message}');
      return null;
    }
  }
}

/// 菜单项
class MenuItem {
  final String title;
  final String? action;
  final bool enabled;
  final bool isSeparator;

  MenuItem({
    required this.title,
    this.action,
    this.enabled = true,
    this.isSeparator = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'action': action,
      'enabled': enabled,
      'isSeparator': isSeparator,
    };
  }
}
