import Cocoa
import FlutterMacOS

@NSApplicationMain
class AppDelegate: FlutterAppDelegate {
  var statusItem: NSStatusItem?
  var channel: FlutterMethodChannel?
  
  override func applicationDidFinishLaunching(_ notification: Notification) {
    let controller = mainFlutterWindow?.contentViewController as! FlutterViewController
    
    // 设置方法通道
    channel = FlutterMethodChannel(
      name: "ai.openclaw/macOS",
      binaryMessenger: controller.engine.binaryMessenger
    )
    
    channel?.setMethodCallHandler { [weak self] (call, result) in
      switch call.method {
      case "showMenuBarIcon":
        self?.showMenuBarIcon()
        result(nil)
        
      case "hideMenuBarIcon":
        self?.hideMenuBarIcon()
        result(nil)
        
      case "setMenuBarTitle":
        if let title = call.arguments as? String {
          self?.statusItem?.button?.title = title
        }
        result(nil)
        
      case "checkAccessibilityPermission":
        let trusted = AXIsProcessTrusted()
        result(trusted)
        
      case "requestAccessibilityPermission":
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true]
        let trusted = AXIsProcessTrustedWithOptions(options as CFDictionary)
        result(trusted)
        
      case "runAppleScript":
        if let script = call.arguments as? String {
          self?.runAppleScript(script, result: result)
        } else {
          result(FlutterError(code: "INVALID_ARGUMENT", message: "Script is required", details: nil))
        }
        
      default:
        result(FlutterMethodNotImplemented)
      }
    }
    
    // 默认显示菜单栏图标
    showMenuBarIcon()
    
    super.applicationDidFinishLaunching(notification)
  }
  
  func showMenuBarIcon() {
    if statusItem == nil {
      statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
      statusItem?.button?.image = NSImage(systemSymbolName: "sparkles", accessibilityDescription: "OpenClaw")
      statusItem?.button?.imagePosition = .imageLeading
      
      let menu = NSMenu()
      menu.addItem(NSMenuItem(title: "打开", action: #selector(openWindow), keyEquivalent: "o"))
      menu.addItem(NSMenuItem.separator())
      menu.addItem(NSMenuItem(title: "设置...", action: #selector(openSettings), keyEquivalent: ","))
      menu.addItem(NSMenuItem.separator())
      menu.addItem(NSMenuItem(title: "退出", action: #selector(quitApp), keyEquivalent: "q"))
      statusItem?.menu = menu
    }
    statusItem?.isVisible = true
  }
  
  func hideMenuBarIcon() {
    statusItem?.isVisible = false
  }
  
  func runAppleScript(_ script: String, result: @escaping FlutterResult) {
    DispatchQueue.global(qos: .userInitiated).async {
      let task = Process()
      task.launchPath = "/usr/bin/osascript"
      task.arguments = ["-e", script]
      
      let pipe = Pipe()
      task.standardOutput = pipe
      task.standardError = pipe
      
      do {
        try task.run()
        task.waitUntilExit()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let output = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines)
        
        DispatchQueue.main.async {
          result(output)
        }
      } catch {
        DispatchQueue.main.async {
          result(FlutterError(code: "APPLESCRIPT_ERROR", message: error.localizedDescription, details: nil))
        }
      }
    }
  }
  
  @objc func openWindow() {
    NSApplication.shared.activate(ignoringOtherApps: true)
    mainFlutterWindow?.makeKeyAndOrderFront(nil)
  }
  
  @objc func openSettings() {
    channel?.invokeMethod("openSettings", arguments: nil)
    openWindow()
  }
  
  @objc func quitApp() {
    NSApplication.shared.terminate(nil)
  }
  
  override func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    // 菜单栏应用：关闭窗口后不退出
    return false
  }
  
  override func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
    return true
  }
}
