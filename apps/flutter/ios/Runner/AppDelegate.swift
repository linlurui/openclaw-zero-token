import Flutter
import UIKit

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  var channel: FlutterMethodChannel?
  
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let controller = window?.rootViewController as! FlutterViewController
    
    // iOS 平台通道
    channel = FlutterMethodChannel(
      name: "ai.openclaw/ios",
      binaryMessenger: controller.binaryMessenger
    )
    
    channel?.setMethodCallHandler { [weak self] (call, result) in
      switch call.method {
      case "isLiveActivitySupported":
        if #available(iOS 16.1, *) {
          result(true)
        } else {
          result(false)
        }
        
      case "isWatchSupported":
        result(WCSession.isSupported())
        
      case "requestNotificationPermission":
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
          DispatchQueue.main.async {
            result(granted)
          }
        }
        
      case "beginBackgroundTask":
        if let identifier = call.arguments as? String {
          let taskId = application.beginBackgroundTask(withName: identifier) {
            result(FlutterError(code: "BACKGROUND_EXPIRED", message: "Background task expired", details: nil))
          }
          result(taskId.rawValue)
        } else {
          result(FlutterError(code: "INVALID_ARGUMENT", message: "Identifier is required", details: nil))
        }
        
      case "endBackgroundTask":
        if let identifier = call.arguments as? Int {
          application.endBackgroundTask(UIBackgroundTaskIdentifier(rawValue: identifier))
          result(nil)
        } else {
          result(FlutterError(code: "INVALID_ARGUMENT", message: "Task identifier is required", details: nil))
        }
        
      default:
        result(FlutterMethodNotImplemented)
      }
    }
    
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}

import WatchConnectivity

extension AppDelegate: WCSessionDelegate {
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    // Watch session activated
  }
  
  func sessionDidBecomeInactive(_ session: WCSession) {
    // Watch session inactive
  }
  
  func sessionDidDeactivate(_ session: WCSession) {
    // Watch session deactivated
  }
  
  func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
    // Forward to Flutter
    message.forEach { (key, value) in
      if let stringValue = value as? String {
        channel?.invokeMethod("onWatchMessage", arguments: ["key": key, "value": stringValue])
      }
    }
  }
}
