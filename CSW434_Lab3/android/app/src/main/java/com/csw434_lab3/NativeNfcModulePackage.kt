package com.csw434_lab3

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NativeNfcModulePackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == NativeNfcModule.NAME) {
            NativeNfcModule(reactContext)
        } else null
    }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            NativeNfcModule.NAME to ReactModuleInfo(
                NativeNfcModule.NAME,   // name
                NativeNfcModule.NAME,   // className
                false,                  // canOverrideExistingModule
                false,                  // needsEagerInit
                false,                  // hasConstants
                false,                  // isCxxModule
                true                    // isTurboModule
            )
        )
    }
}