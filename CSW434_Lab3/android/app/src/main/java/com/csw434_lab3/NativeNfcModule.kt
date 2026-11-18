package com.csw434_lab3

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.nfc.NfcAdapter
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = NativeNfcModule.NAME)
class NativeNfcModule(reactContext: ReactApplicationContext) :
    NativeNfcModuleSpec(reactContext), SensorEventListener {

    companion object {
        const val NAME = "NativeNfcModule"
    }

    // --- NFC Variables ---
    private val nfcAdapter: NfcAdapter? = NfcAdapter.getDefaultAdapter(reactContext)

    // --- Compass / Sensor Variables ---
    private val sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val magnetometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    private var gravity: FloatArray? = null
    private var geomagnetic: FloatArray? = null
    private var lastUpdateTime: Long = 0

    override fun getName() = NAME

    // ==========================================
    // EXERCISE 1: NFC METHODS
    // ==========================================
    override fun isSupported(promise: Promise) {
        promise.resolve(nfcAdapter != null)
    }

    override fun isEnabled(promise: Promise) {
        promise.resolve(nfcAdapter?.isEnabled == true)
    }

    override fun startReading(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }
        val adapter = nfcAdapter
        if (adapter == null) {
            promise.reject("NFC_UNSUPPORTED", "NFC not supported on this device")
            return
        }
        promise.resolve("Ready to scan NFC tag")
    }

    override fun stopReading(promise: Promise) {
        promise.resolve(true)
    }

    // ==========================================
    // EXERCISE 2: COMPASS (MAGNETOMETER) METHODS
    // ==========================================
    override fun startCompass() {
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
        magnetometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    override fun stopCompass() {
        sensorManager.unregisterListener(this)
    }

    override fun addListener(eventName: String) {
        // Bắt buộc có cho NativeEventEmitter / DeviceEventEmitter
    }

    override fun removeListeners(count: Double) {
        // Bắt buộc có cho NativeEventEmitter / DeviceEventEmitter
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            gravity = event.values.clone()
        } else if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
            geomagnetic = event.values.clone()
        }

        if (gravity != null && geomagnetic != null) {
            val r = FloatArray(9)
            val i = FloatArray(9)
            if (SensorManager.getRotationMatrix(r, i, gravity, geomagnetic)) {
                val orientation = FloatArray(3)
                SensorManager.getOrientation(r, orientation)
                
                // Chuyển đổi Radian sang Độ (0 -> 360)
                var azimuth = Math.toDegrees(orientation[0].toDouble()).toFloat()
                azimuth = (azimuth + 360) % 360

                // Giới hạn tần suất gửi event (khoảng 60ms/lần để mượt UI mà không lag bridge)
                val currentTime = System.currentTimeMillis()
                if (currentTime - lastUpdateTime > 60) {
                    lastUpdateTime = currentTime
                    sendCompassEvent(azimuth)
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun sendCompassEvent(degree: Float) {
        if (reactApplicationContext.hasActiveReactInstance()) {
            val params = Arguments.createMap().apply {
                putDouble("heading", degree.toDouble())
            }
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onCompassChange", params)
        }
    }
}