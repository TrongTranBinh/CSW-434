package com.csw434_Lab2

import com.facebook.react.bridge.*

class BrightnessModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "BrightnessModule"

  @ReactMethod
  fun setBrightness(brightnessValue: Double) {
    Log.d("BrightnessModule", "Gia tri nhan duoc tu JS: $brightnessValue")
    val activity = reactApplicationContext.currentActivity ?: return
    val floatBrightness = brightnessValue.toFloat()

    activity.runOnUiThread {
      try {
        val layoutParams = activity.window.attributes
        layoutParams.screenBrightness = floatBrightness
        activity.window.attributes = layoutParams
      } catch (e: Exception) {
        e.printStackTrace()
      }
    }
  }
}