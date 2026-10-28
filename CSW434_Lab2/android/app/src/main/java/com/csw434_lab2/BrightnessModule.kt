package com.csw434_lab2

import android.util.Log
import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BrightnessModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "BrightnessModule"

  @ReactMethod
  fun setBrightness(brightnessValue: Double) {
    // Clamp to valid range [0.01, 1.0]
    val clamped = brightnessValue.toFloat().coerceIn(0.01f, 1.0f)
    Log.d("BrightnessModule", "setBrightness called: $clamped")

    // Re-fetch currentActivity INSIDE the UI thread block to avoid stale reference
    val appContext = reactApplicationContext
    appContext.currentActivity?.runOnUiThread {
      // Fetch again inside the lambda — safest pattern in React Native
      val act = appContext.currentActivity ?: return@runOnUiThread
      try {
        val win = act.window
        val lp = win.attributes
        lp.screenBrightness = clamped
        win.attributes = lp
        Log.d("BrightnessModule", "screenBrightness set to $clamped")
      } catch (e: Exception) {
        Log.e("BrightnessModule", "Error setting brightness", e)
      }
    }
  }
}