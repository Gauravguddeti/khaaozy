package com.vishwakarma.canteenapp

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class CanteenApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
    }
}
