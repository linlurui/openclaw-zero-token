import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// 平台服务 - 提供跨平台能力检测和平台特定功能
class PlatformService {
  static final PlatformService instance = PlatformService._();
  PlatformService._();

  late final SharedPreferences _prefs;
  late final DeviceInfoPlugin _deviceInfo;
  late final PackageInfo _packageInfo;

  BaseDeviceInfo? _deviceData;

  /// 初始化
  Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
    _deviceInfo = DeviceInfoPlugin();
    _packageInfo = await PackageInfo.fromPlatform();
    _deviceData = await _deviceInfo.deviceInfo;
  }

  // ========== 平台检测 ==========

  bool get isDesktop => isMacOS || isWindows || isLinux;
  bool get isMobile => isAndroid || isIOS;

  bool get isMacOS => !kIsWeb && Platform.isMacOS;
  bool get isWindows => !kIsWeb && Platform.isWindows;
  bool get isLinux => !kIsWeb && Platform.isLinux;
  bool get isAndroid => !kIsWeb && Platform.isAndroid;
  bool get isIOS => !kIsWeb && Platform.isIOS;

  String get platformName {
    if (isMacOS) return 'macos';
    if (isWindows) return 'windows';
    if (isLinux) return 'linux';
    if (isAndroid) return 'android';
    if (isIOS) return 'ios';
    return 'unknown';
  }

  String get homeDirectory {
    if (isMacOS || isLinux) {
      return Platform.environment['HOME'] ?? '';
    } else if (isWindows) {
      return Platform.environment['USERPROFILE'] ?? '';
    }
    return '';
  }

  // ========== 设备信息 ==========

  String get deviceId {
    if (_deviceData == null) return 'unknown';
    
    if (isAndroid) {
      final info = _deviceData as AndroidDeviceInfo;
      return info.id;
    } else if (isIOS) {
      final info = _deviceData as IosDeviceInfo;
      return info.identifierForVendor ?? 'unknown';
    } else if (isMacOS) {
      final info = _deviceData as MacOsDeviceInfo;
      return info.systemGUID ?? 'unknown';
    } else if (isWindows) {
      final info = _deviceData as WindowsDeviceInfo;
      return info.deviceId;
    } else if (isLinux) {
      final info = _deviceData as LinuxDeviceInfo;
      return info.machineId ?? 'unknown';
    }
    return 'unknown';
  }

  String get deviceName {
    if (_deviceData == null) return 'Unknown Device';
    
    if (isAndroid) {
      final info = _deviceData as AndroidDeviceInfo;
      return info.model;
    } else if (isIOS) {
      final info = _deviceData as IosDeviceInfo;
      return info.name;
    } else if (isMacOS) {
      final info = _deviceData as MacOsDeviceInfo;
      return info.computerName;
    } else if (isWindows) {
      final info = _deviceData as WindowsDeviceInfo;
      return info.computerName;
    } else if (isLinux) {
      final info = _deviceData as LinuxDeviceInfo;
      return info.prettyName;
    }
    return 'Unknown Device';
  }

  String get osVersion {
    if (_deviceData == null) return 'unknown';
    
    if (isAndroid) {
      final info = _deviceData as AndroidDeviceInfo;
      return 'Android ${info.version.release} (SDK ${info.version.sdkInt})';
    } else if (isIOS) {
      final info = _deviceData as IosDeviceInfo;
      return 'iOS ${info.systemVersion}';
    } else if (isMacOS) {
      final info = _deviceData as MacOsDeviceInfo;
      return 'macOS ${info.osVersion}';
    } else if (isWindows) {
      final info = _deviceData as WindowsDeviceInfo;
      return 'Windows ${info.displayVersion}';
    } else if (isLinux) {
      final info = _deviceData as LinuxDeviceInfo;
      return info.version ?? 'Linux';
    }
    return 'unknown';
  }

  String get appVersion => _packageInfo.version;
  String get appName => _packageInfo.appName;
  String get packageName => _packageInfo.packageName;

  // ========== 存储操作 ==========

  Future<bool> setString(String key, String value) => _prefs.setString(key, value);
  String? getString(String key) => _prefs.getString(key);
  
  Future<bool> setInt(String key, int value) => _prefs.setInt(key, value);
  int? getInt(String key) => _prefs.getInt(key);
  
  Future<bool> setBool(String key, bool value) => _prefs.setBool(key, value);
  bool? getBool(String key) => _prefs.getBool(key);
  
  Future<bool> remove(String key) => _prefs.remove(key);

  // ========== 窗口操作（桌面端） ==========

  Future<void> hideWindow() async {
    if (!isDesktop) return;
    // 由 window_manager 包处理
  }

  Future<void> showWindow() async {
    if (!isDesktop) return;
    // 由 window_manager 包处理
  }

  Future<void> minimizeToTray() async {
    if (!isDesktop) return;
    // 由 tray_manager 包处理
  }

  // ========== 屏幕信息 ==========

  Size get screenSize {
    // 由 WidgetsBinding 获取
    return WidgetsBinding.instance.platformDispatcher.implicitView?.physicalSize ?? 
        const Size(400, 600);
  }

  double get devicePixelRatio {
    return WidgetsBinding.instance.platformDispatcher.implicitView?.devicePixelRatio ?? 1.0;
  }

  bool get isSmallScreen => screenSize.width < 600;
}
