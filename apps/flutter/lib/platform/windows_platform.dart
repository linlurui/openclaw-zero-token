import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

/// Windows 平台特定功能实现
class WindowsPlatform {
  static const _channel = MethodChannel('ai.openclaw/windows');

  /// 显示系统托盘图标
  static Future<void> showTrayIcon() async {
    try {
      await _channel.invokeMethod('showTrayIcon');
    } on PlatformException catch (e) {
      debugPrint('Failed to show tray icon: ${e.message}');
    }
  }

  /// 隐藏系统托盘图标
  static Future<void> hideTrayIcon() async {
    try {
      await _channel.invokeMethod('hideTrayIcon');
    } on PlatformException catch (e) {
      debugPrint('Failed to hide tray icon: ${e.message}');
    }
  }

  /// 设置托盘图标提示文本
  static Future<void> setTrayToolTip(String tooltip) async {
    try {
      await _channel.invokeMethod('setTrayToolTip', {'tooltip': tooltip});
    } on PlatformException catch (e) {
      debugPrint('Failed to set tray tooltip: ${e.message}');
    }
  }

  /// 显示托盘菜单
  static Future<void> showTrayMenu(List<MenuItem> items) async {
    try {
      await _channel.invokeMethod('showTrayMenu', {
        'items': items.map((i) => i.toMap()).toList(),
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to show tray menu: ${e.message}');
    }
  }

  /// 执行 PowerShell 命令
  static Future<String?> runPowerShell(String command) async {
    try {
      return await _channel.invokeMethod('runPowerShell', {'command': command});
    } on PlatformException catch (e) {
      debugPrint('Failed to run PowerShell: ${e.message}');
      return null;
    }
  }

  /// 开始屏幕录制
  static Future<void> startScreenRecording({
    int? monitorIndex,
    int fps = 30,
    bool includeAudio = false,
  }) async {
    try {
      await _channel.invokeMethod('startScreenRecording', {
        'monitorIndex': monitorIndex,
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

  /// 获取显示器列表
  static Future<List<MonitorInfo>> getMonitors() async {
    try {
      final List<dynamic>? monitors = await _channel.invokeMethod('getMonitors');
      if (monitors == null) return [];
      return monitors
          .map((m) => MonitorInfo.fromMap(Map<String, dynamic>.from(m)))
          .toList();
    } on PlatformException catch (e) {
      debugPrint('Failed to get monitors: ${e.message}');
      return [];
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

/// 显示器信息
class MonitorInfo {
  final int index;
  final String name;
  final int width;
  final int height;
  final bool isPrimary;

  MonitorInfo({
    required this.index,
    required this.name,
    required this.width,
    required this.height,
    required this.isPrimary,
  });

  factory MonitorInfo.fromMap(Map<String, dynamic> map) {
    return MonitorInfo(
      index: map['index'] ?? 0,
      name: map['name'] ?? '',
      width: map['width'] ?? 0,
      height: map['height'] ?? 0,
      isPrimary: map['isPrimary'] ?? false,
    );
  }
}
