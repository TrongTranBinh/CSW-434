package com.csw434_lab3

import android.content.Context
import android.nfc.NfcAdapter
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = NativeNfcModule.NAME)
class NativeNfcModule(reactContext: ReactApplicationContext) :
    NativeNfcModuleSpec(reactContext) {

    companion object {
        const val NAME = "NativeNfcModule"
    }

    private val nfcAdapter: NfcAdapter? = NfcAdapter.getDefaultAdapter(reactContext)

    override fun getName() = NAME

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
            promise.reject("NFC_UNSUPPORTED", "NFC not supported")
            return
        }
        promise.resolve("NFC Reading started simulation")
    }

    override fun stopReading(promise: Promise) {
        promise.resolve(true)
    }
}