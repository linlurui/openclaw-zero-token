import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

/// iOS 平台特定功能实现
class IOSPlatform {
  static const _channel = MethodChannel('ai.openclaw/ios');

  /// 检查 Live Activity 支持
  static Future<bool> isLiveActivitySupported() async {
    try {
      return await _channel.invokeMethod('isLiveActivitySupported') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to check Live Activity support: ${e.message}');
      return false;
    }
  }

  /// 开始 Live Activity
  static Future<String?> startLiveActivity({
    required String title,
    required String subtitle,
  }) async {
    try {
      return await _channel.invokeMethod('startLiveActivity', {
        'title': title,
        'subtitle': subtitle,
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to start Live Activity: ${e.message}');
      return null;
    }
  }

  /// 更新 Live Activity
  static Future<void> updateLiveActivity({
    required String activityId,
    required String title,
    required String subtitle,
  }) async {
    try {
      await _channel.invokeMethod('updateLiveActivity', {
        'activityId': activityId,
        'title': title,
        'subtitle': subtitle,
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to update Live Activity: ${e.message}');
    }
  }

  /// 结束 Live Activity
  static Future<void> endLiveActivity(String activityId) async {
    try {
      await _channel.invokeMethod('endLiveActivity', {
        'activityId': activityId,
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to end Live Activity: ${e.message}');
    }
  }

  /// 检查 Apple Watch 支持
  static Future<bool> isWatchSupported() async {
    try {
      return await _channel.invokeMethod('isWatchSupported') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to check Watch support: ${e.message}');
      return false;
    }
  }

  /// 发送消息到 Watch
  static Future<bool> sendToWatch({
    required String key,
    required String value,
  }) async {
    try {
      return await _channel.invokeMethod('sendToWatch', {
        'key': key,
        'value': value,
      }) ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to send to Watch: ${e.message}');
      return false;
    }
  }

  /// 从 Watch 接收消息
  static void onWatchMessage(Function(String key, String value) callback) {
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onWatchMessage') {
        final key = call.arguments['key'] as String?;
        final value = call.arguments['value'] as String?;
        if (key != null && value != null) {
          callback(key, value);
        }
      }
    });
  }

  /// 开始后台任务
  static Future<void> beginBackgroundTask(String identifier) async {
    try {
      await _channel.invokeMethod('beginBackgroundTask', {
        'identifier': identifier,
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to begin background task: ${e.message}');
    }
  }

  /// 结束后台任务
  static Future<void> endBackgroundTask(String identifier) async {
    try {
      await _channel.invokeMethod('endBackgroundTask', {
        'identifier': identifier,
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to end background task: ${e.message}');
    }
  }

  /// 请求通知权限
  static Future<bool> requestNotificationPermission() async {
    try {
      return await _channel.invokeMethod('requestNotificationPermission') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to request notification permission: ${e.message}');
      return false;
    }
  }
}
