package com.csw434_Lab2

import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.facebook.react.bridge.*

class BatteryModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "BatteryModule"

  @ReactMethod
  fun getBatteryLevel(promise: Promise) {
    try {
      val getBatteryIntent = reactApplicationContext.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
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
}