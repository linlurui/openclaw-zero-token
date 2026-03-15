package ai.openclaw.client

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.telephony.SmsManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "ai.openclaw/android"
    
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "sendSms" -> {
                    val phoneNumber = call.argument<String>("phoneNumber")
                    val message = call.argument<String>("message")
                    if (phoneNumber != null && message != null) {
                        try {
                            val smsManager: SmsManager = getSystemService(SmsManager::class.java)
                            smsManager.sendTextMessage(phoneNumber, null, message, null, null)
                            result.success(true)
                        } catch (e: Exception) {
                            result.error("SMS_ERROR", e.message, null)
                        }
                    } else {
                        result.error("INVALID_ARGUMENT", "Phone number and message are required", null)
                    }
                }
                
                "makePhoneCall" -> {
                    val phoneNumber = call.argument<String>("phoneNumber")
                    if (phoneNumber != null) {
                        try {
                            val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:$phoneNumber"))
                            startActivity(intent)
                            result.success(true)
                        } catch (e: Exception) {
                            result.error("CALL_ERROR", e.message, null)
                        }
                    } else {
                        result.error("INVALID_ARGUMENT", "Phone number is required", null)
                    }
                }
                
                "checkSmsPermission" -> {
                    val hasPermission = checkSelfPermission(android.Manifest.permission.SEND_SMS) == 
                        android.content.pm.PackageManager.PERMISSION_GRANTED
                    result.success(hasPermission)
                }
                
                "requestSmsPermission" -> {
                    requestPermissions(arrayOf(android.Manifest.permission.SEND_SMS), 1001)
                    result.success(true)
                }
                
                "checkPhonePermission" -> {
                    val hasPermission = checkSelfPermission(android.Manifest.permission.CALL_PHONE) == 
                        android.content.pm.PackageManager.PERMISSION_GRANTED
                    result.success(hasPermission)
                }
                
                "requestPhonePermission" -> {
                    requestPermissions(arrayOf(android.Manifest.permission.CALL_PHONE), 1002)
                    result.success(true)
                }
                
                "startForegroundService" -> {
                    val title = call.argument<String>("title") ?: "OpenClaw"
                    val content = call.argument<String>("content") ?: "Running..."
                    
                    val serviceIntent = Intent(this, OpenClawService::class.java)
                    serviceIntent.putExtra("title", title)
                    serviceIntent.putExtra("content", content)
                    
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        startForegroundService(serviceIntent)
                    } else {
                        startService(serviceIntent)
                    }
                    result.success(null)
                }
                
                "stopForegroundService" -> {
                    val serviceIntent = Intent(this, OpenClawService::class.java)
                    stopService(serviceIntent)
                    result.success(null)
                }
                
                else -> result.notImplemented()
            }
        }
    }
}
