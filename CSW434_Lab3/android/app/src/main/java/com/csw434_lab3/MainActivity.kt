package com.csw434_lab3

import android.app.PendingIntent
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  private var nfcAdapter: NfcAdapter? = null

  override fun getMainComponentName(): String = "CSW434_Lab3"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    nfcAdapter = NfcAdapter.getDefaultAdapter(this)
  }

  override fun onResume() {
    super.onResume()
    val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0
    val pendingIntent = PendingIntent.getActivity(this, 0, intent, flags)
    nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
  }

  override fun onPause() {
    super.onPause()
    nfcAdapter?.disableForegroundDispatch(this)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    if (NfcAdapter.ACTION_TAG_DISCOVERED == intent.action ||
        NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action ||
        NfcAdapter.ACTION_TECH_DISCOVERED == intent.action) {
      
      val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
      } else {
        @Suppress("DEPRECATION")
        intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
      }

      tag?.let {
        val tagId = it.id.joinToString(":") { byte -> "%02X".format(byte) }
        val techList = it.techList.joinToString(", ") { tech -> tech.substringAfterLast('.') }
        
        val reactContext = reactInstanceManager?.currentReactContext
        val params = Arguments.createMap().apply {
          putString("id", tagId)
          putString("tech", techList)
        }
        reactContext
          ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          ?.emit("onNfcTagDetected", params)
      }
    }
  }
}