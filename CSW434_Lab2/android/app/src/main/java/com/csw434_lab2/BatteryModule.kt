package com.csw434_lab2

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BatteryModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private val context = reactContext
  private var batteryReceiver: BroadcastReceiver? = null

  override fun getName(): String = "BatteryModule"

  private fun sendEvent(eventName: String, params: Any?) {
    context
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  @ReactMethod
  fun getBatteryLevel(promise: Promise) {
    try {
      val getBatteryIntent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
      val batteryPct: Float? = getBatteryIntent?.let { intent ->
        val level: Int = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale: Int = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
        level * 100 / scale.toFloat()
      }
      promise.resolve(batteryPct)
    } catch(e: Exception) {
      promise.reject("BATTERY_ERROR", "Failed to get battery level", e)
    }
  }

  @ReactMethod
  fun startListening() {
    if (batteryReceiver != null) return

    batteryReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BATTERY_CHANGED) {
          val level: Int = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
          val scale: Int = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
          if (level != -1 && scale != -1) {
            val batteryPct = level * 100 / scale.toFloat()
            sendEvent("BatteryLevelChanged", batteryPct)
          }
        }
      }
    }

    val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
    context.registerReceiver(batteryReceiver, filter)
  }

  @ReactMethod
  fun stopListening() {
    batteryReceiver?.let {
      try {
        context.unregisterReceiver(it)
      } catch (e: Exception) {
      }
      batteryReceiver = null
    }
  }
}