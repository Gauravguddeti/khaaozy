package com.vishwakarma.canteenapp.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.vishwakarma.canteenapp.ui.screens.auth.LoginScreen
import com.vishwakarma.canteenapp.ui.screens.auth.OwnerLoginScreen
import com.vishwakarma.canteenapp.ui.screens.auth.SignUpScreen
import com.vishwakarma.canteenapp.ui.screens.auth.SplashScreen
import com.vishwakarma.canteenapp.ui.screens.auth.WelcomeScreen
import com.vishwakarma.canteenapp.ui.screens.user.CanteenListScreen
import com.vishwakarma.canteenapp.ui.screens.user.CartScreen
import com.vishwakarma.canteenapp.ui.screens.user.CollegeSelectorScreen
import com.vishwakarma.canteenapp.ui.screens.user.FeedbackScreen
import com.vishwakarma.canteenapp.ui.screens.user.MenuScreen
import com.vishwakarma.canteenapp.ui.screens.user.OrderHistoryScreen
import com.vishwakarma.canteenapp.ui.screens.user.OrderStatusScreen
import com.vishwakarma.canteenapp.ui.screens.user.ProfileScreen
import com.vishwakarma.canteenapp.ui.screens.owner.AIMenuUploadScreen
import com.vishwakarma.canteenapp.ui.screens.owner.MenuManagementScreen
import com.vishwakarma.canteenapp.ui.screens.owner.OrderManagementScreen
import com.vishwakarma.canteenapp.ui.screens.owner.OwnerDashboardScreen
import com.vishwakarma.canteenapp.ui.screens.owner.OwnerProfileScreen
import com.vishwakarma.canteenapp.ui.screens.settings.SettingsScreen

@Composable
fun CanteenNavigation(
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = Screen.Splash,
        modifier = modifier
    ) {
        // Authentication screens
        composable<Screen.Splash> {
            SplashScreen(
                onNavigateToWelcome = {
                    navController.navigate(Screen.Welcome) {
                        popUpTo(Screen.Splash) { inclusive = true }
                    }
                },
                onNavigateToMain = {
                    navController.navigate(Screen.CollegeSelector) {
                        popUpTo(Screen.Splash) { inclusive = true }
                    }
                },
                onNavigateToOwnerDashboard = {
                    navController.navigate(Screen.OwnerDashboard) {
                        popUpTo(Screen.Splash) { inclusive = true }
                    }
                }
            )
        }
        
        composable<Screen.Welcome> {
            WelcomeScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login) },
                onNavigateToSignUp = { navController.navigate(Screen.SignUp) },
                onNavigateToOwnerLogin = { navController.navigate(Screen.OwnerLogin) }
            )
        }
        
        composable<Screen.Login> {
            LoginScreen(
                onNavigateToSignUp = { navController.navigate(Screen.SignUp) },
                onNavigateToMain = {
                    navController.navigate(Screen.CollegeSelector) {
                        popUpTo(Screen.Welcome) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.SignUp> {
            SignUpScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login) },
                onNavigateToMain = {
                    navController.navigate(Screen.CollegeSelector) {
                        popUpTo(Screen.Welcome) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.OwnerLogin> {
            OwnerLoginScreen(
                onNavigateToOwnerDashboard = {
                    navController.navigate(Screen.OwnerDashboard) {
                        popUpTo(Screen.Welcome) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        // User screens
        composable<Screen.CollegeSelector> {
            CollegeSelectorScreen(
                onNavigateToCanteenList = { collegeId ->
                    navController.navigate(Screen.CanteenList(collegeId))
                },
                onNavigateToProfile = { navController.navigate(Screen.Profile) }
            )
        }
        
        composable<Screen.CanteenList> { backStackEntry ->
            val canteenList: Screen.CanteenList = backStackEntry.toRoute()
            CanteenListScreen(
                collegeId = canteenList.collegeId,
                onNavigateToMenu = { canteenId ->
                    navController.navigate(Screen.MenuScreen(canteenId))
                },
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCart = { navController.navigate(Screen.Cart) }
            )
        }
        
        composable<Screen.MenuScreen> { backStackEntry ->
            val menuScreen: Screen.MenuScreen = backStackEntry.toRoute()
            MenuScreen(
                canteenId = menuScreen.canteenId,
                onNavigateToCart = { navController.navigate(Screen.Cart) },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.Cart> {
            CartScreen(
                onNavigateToOrderStatus = {
                    navController.navigate(Screen.OrderStatus) {
                        popUpTo(Screen.Cart) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.OrderStatus> {
            OrderStatusScreen(
                onNavigateToHistory = { navController.navigate(Screen.OrderHistory) },
                onNavigateToMenu = { canteenId ->
                    navController.navigate(Screen.MenuScreen(canteenId))
                }
            )
        }
        
        composable<Screen.OrderHistory> {
            OrderHistoryScreen(
                onNavigateToFeedback = { canteenId ->
                    navController.navigate(Screen.Feedback(canteenId))
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.Feedback> { backStackEntry ->
            val feedback: Screen.Feedback = backStackEntry.toRoute()
            FeedbackScreen(
                canteenId = feedback.canteenId,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.Profile> {
            ProfileScreen(
                onNavigateToSettings = { navController.navigate(Screen.Settings) },
                onNavigateToHistory = { navController.navigate(Screen.OrderHistory) },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        // Owner screens
        composable<Screen.OwnerDashboard> {
            OwnerDashboardScreen(
                onNavigateToMenuManagement = { navController.navigate(Screen.MenuManagement) },
                onNavigateToOrderManagement = { navController.navigate(Screen.OrderManagement) },
                onNavigateToProfile = { navController.navigate(Screen.OwnerProfile) }
            )
        }
        
        composable<Screen.MenuManagement> {
            MenuManagementScreen(
                onNavigateToAIUpload = { navController.navigate(Screen.AIMenuUpload) },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.OrderManagement> {
            OrderManagementScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.AIMenuUpload> {
            AIMenuUploadScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable<Screen.OwnerProfile> {
            OwnerProfileScreen(
                onNavigateToSettings = { navController.navigate(Screen.Settings) },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        // Settings
        composable<Screen.Settings> {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
