package com.vishwakarma.canteenapp.ui.navigation

import kotlinx.serialization.Serializable

// Navigation destinations using type-safe navigation
@Serializable
sealed class Screen {
    
    // Authentication screens
    @Serializable
    object Splash : Screen()
    
    @Serializable
    object Welcome : Screen()
    
    @Serializable
    object Login : Screen()
    
    @Serializable
    object SignUp : Screen()
    
    @Serializable
    object OwnerLogin : Screen()
    
    // User screens
    @Serializable
    object CollegeSelector : Screen()
    
    @Serializable
    data class CanteenList(val collegeId: String) : Screen()
    
    @Serializable
    data class MenuScreen(val canteenId: String) : Screen()
    
    @Serializable
    object Cart : Screen()
    
    @Serializable
    object OrderStatus : Screen()
    
    @Serializable
    object OrderHistory : Screen()
    
    @Serializable
    data class Feedback(val canteenId: String) : Screen()
    
    @Serializable
    object Profile : Screen()
    
    // Owner screens
    @Serializable
    object OwnerDashboard : Screen()
    
    @Serializable
    object MenuManagement : Screen()
    
    @Serializable
    object OrderManagement : Screen()
    
    @Serializable
    object AIMenuUpload : Screen()
    
    @Serializable
    object OwnerProfile : Screen()
    
    // Settings
    @Serializable
    object Settings : Screen()
}
