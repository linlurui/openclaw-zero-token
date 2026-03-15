import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

/// Android 平台特定功能实现
class AndroidPlatform {
  static const _channel = MethodChannel('ai.openclaw/android');

  /// 发送短信
  static Future<bool> sendSms({
    required String phoneNumber,
    required String message,
  }) async {
    try {
      return await _channel.invokeMethod('sendSms', {
        'phoneNumber': phoneNumber,
        'message': message,
      }) ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to send SMS: ${e.message}');
      return false;
    }
  }

  /// 拨打电话
  static Future<bool> makePhoneCall(String phoneNumber) async {
    try {
      return await _channel.invokeMethod('makePhoneCall', {
        'phoneNumber': phoneNumber,
      }) ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to make phone call: ${e.message}');
      return false;
    }
  }

  /// 获取短信列表
  static Future<List<SmsMessage>> getSmsMessages({
    int? limit,
    String? address,
  }) async {
    try {
      final List<dynamic>? messages = await _channel.invokeMethod('getSmsMessages', {
        'limit': limit,
        'address': address,
      });
      if (messages == null) return [];
      return messages
          .map((m) => SmsMessage.fromMap(Map<String, dynamic>.from(m)))
          .toList();
    } on PlatformException catch (e) {
      debugPrint('Failed to get SMS messages: ${e.message}');
      return [];
    }
  }

  /// 检查短信权限
  static Future<bool> checkSmsPermission() async {
    try {
      return await _channel.invokeMethod('checkSmsPermission') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to check SMS permission: ${e.message}');
      return false;
    }
  }

  /// 请求短信权限
  static Future<bool> requestSmsPermission() async {
    try {
      return await _channel.invokeMethod('requestSmsPermission') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to request SMS permission: ${e.message}');
      return false;
    }
  }

  /// 检查电话权限
  static Future<bool> checkPhonePermission() async {
    try {
      return await _channel.invokeMethod('checkPhonePermission') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to check phone permission: ${e.message}');
      return false;
    }
  }

  /// 请求电话权限
  static Future<bool> requestPhonePermission() async {
    try {
      return await _channel.invokeMethod('requestPhonePermission') ?? false;
    } on PlatformException catch (e) {
      debugPrint('Failed to request phone permission: ${e.message}');
      return false;
    }
  }

  /// 开始前台服务
  static Future<void> startForegroundService({
    required String title,
    required String content,
  }) async {
    try {
      await _channel.invokeMethod('startForegroundService', {
        'title': title,
        'content': content,
      });
    } on PlatformException catch (e) {
      debugPrint('Failed to start foreground service: ${e.message}');
    }
  }

  /// 停止前台服务
  static Future<void> stopForegroundService() async {
    try {
      await _channel.invokeMethod('stopForegroundService');
    } on PlatformException catch (e) {
      debugPrint('Failed to stop foreground service: ${e.message}');
    }
  }
}

/// 短信消息
class SmsMessage {
  final String id;
  final String address;
  final String body;
  final DateTime date;
  final int type; // 1 = received, 2 = sent

  SmsMessage({
    required this.id,
    required this.address,
    required this.body,
    required this.date,
    required this.type,
  });

  factory SmsMessage.fromMap(Map<String, dynamic> map) {
    return SmsMessage(
      id: map['id']?.toString() ?? '',
      address: map['address'] ?? '',
      body: map['body'] ?? '',
      date: DateTime.fromMillisecondsSinceEpoch(map['date'] ?? 0),
      type: map['type'] ?? 1,
    );
  }

  bool get isReceived => type == 1;
  bool get isSent => type == 2;
}
