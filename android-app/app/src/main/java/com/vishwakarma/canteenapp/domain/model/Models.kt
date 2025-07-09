package com.vishwakarma.canteenapp.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val role: UserRole,
    val collegeId: String?,
    val firstName: String,
    val lastName: String,
    val phoneNumber: String?,
    val profileImageUrl: String?,
    val studentIdPhotoUrl: String? = null,
    val classBatch: String? = null,
    val isPhoneVerified: Boolean = false,
    val isEmailVerified: Boolean = false,
    val isVerified: Boolean = false,
    val collegeName: String? = null,
    val createdAt: String,
    val updatedAt: String
) {
    val fullName: String
        get() = "$firstName $lastName"
}

@Serializable
enum class UserRole {
    USER,    // Students & Faculty
    OWNER,   // Canteen Owners
    ADMIN    // Administrators
}

@Serializable
data class College(
    val id: String,
    val name: String,
    val location: String,
    val description: String?,
    val imageUrl: String?,
    val isActive: Boolean = true,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class Canteen(
    val id: String,
    val name: String,
    val collegeId: String,
    val ownerId: String?,
    val description: String?,
    val imageUrl: String?,
    val location: String?,
    val phoneNumber: String?,
    val operatingHours: OperatingHours,
    val status: CanteenStatus,
    val rating: Double = 0.0,
    val totalReviews: Int = 0,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class OperatingHours(
    val openTime: String,   // HH:mm format
    val closeTime: String,  // HH:mm format
    val isOpen24Hours: Boolean = false,
    val closedDays: List<String> = emptyList() // Days when canteen is closed
)

@Serializable
enum class CanteenStatus {
    OPEN,
    CLOSED,
    TEMPORARILY_CLOSED,
    MAINTENANCE
}

@Serializable
data class MenuItem(
    val id: String,
    val canteenId: String,
    val name: String,
    val description: String?,
    val price: Double,
    val category: FoodCategory,
    val type: FoodType,
    val imageUrl: String?,
    val isAvailable: Boolean = true,
    val preparationTime: Int, // in minutes
    val ingredients: List<String> = emptyList(),
    val allergens: List<String> = emptyList(),
    val nutritionalInfo: NutritionalInfo?,
    val popularity: Int = 0,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
enum class FoodCategory {
    BREAKFAST,
    LUNCH,
    DINNER,
    SNACKS,
    BEVERAGES,
    DESSERTS,
    FAST_FOOD,
    SOUTH_INDIAN,
    NORTH_INDIAN,
    CHINESE,
    CONTINENTAL,
    STREET_FOOD
}

@Serializable
enum class FoodType {
    VEG,
    NON_VEG,
    VEGAN,
    JAIN,
    GLUTEN_FREE
}

@Serializable
data class NutritionalInfo(
    val calories: Int?,
    val protein: Double?,  // in grams
    val carbs: Double?,    // in grams
    val fat: Double?,      // in grams
    val fiber: Double?,    // in grams
    val sugar: Double?     // in grams
)

@Serializable
data class Order(
    val id: String,
    val userId: String,
    val canteenId: String,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val status: OrderStatus,
    val orderType: OrderType,
    val paymentStatus: PaymentStatus,
    val specialInstructions: String?,
    val estimatedPreparationTime: Int, // in minutes
    val orderNumber: String,
    val createdAt: String,
    val updatedAt: String,
    val completedAt: String?
)

@Serializable
data class OrderItem(
    val menuItemId: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val specialInstructions: String?
)

@Serializable
enum class OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY,
    COMPLETED,
    CANCELLED,
    REFUNDED
}

@Serializable
enum class OrderType {
    DINE_IN,
    TAKEAWAY
}

@Serializable
enum class PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED
}

@Serializable
data class Feedback(
    val id: String,
    val userId: String,
    val canteenId: String,
    val orderId: String?,
    val rating: Int, // 1-5 stars
    val comment: String?,
    val foodQuality: Int?,
    val serviceQuality: Int?,
    val cleanliness: Int?,
    val value: Int?,
    val imageUrls: List<String> = emptyList(),
    val isAnonymous: Boolean = false,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class CartItem(
    val menuItemId: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val specialInstructions: String?,
    val imageUrl: String?
)

// Authentication and validation models
@Serializable
data class SignUpRequest(
    val firstName: String,
    val lastName: String,
    val phoneNumber: String,
    val email: String,
    val password: String,
    val classBatch: String? = null,
    val profileImageUrl: String? = null,
    val studentIdPhotoUrl: String? = null
)

@Serializable
data class OtpVerificationRequest(
    val identifier: String, // phone or email
    val otp: String,
    val type: OtpType
)

@Serializable
enum class OtpType {
    PHONE_VERIFICATION,
    EMAIL_VERIFICATION,
    PASSWORD_RESET
}

@Serializable
data class ValidationResult(
    val isValid: Boolean,
    val errorMessage: String? = null
)

@Serializable
data class AuthState(
    val isAuthenticated: Boolean = false,
    val currentUser: User? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val isPhoneVerified: Boolean = false,
    val isEmailVerified: Boolean = false
)

@Serializable
data class DeviceSession(
    val id: String,
    val userId: String,
    val deviceName: String,
    val deviceType: String,
    val loginTime: String,
    val lastActiveTime: String,
    val ipAddress: String? = null,
    val isCurrentDevice: Boolean = false
)

// Message pools for randomized UI messages
object MessagePools {
    val signupSuccess = listOf(
        "Welcome to the table — let's get ordering! 🍽️",
        "Account created. Bhookh mode unlocked.",
        "You did the hard part. Now go feed yourself. 🍛"
    )
    
    val missingFields = listOf(
        "Something's missing... not you, but some info is.",
        "Still a few blanks left. Khaoozy doesn't like mysteries.",
        "Oops. We need all the ingredients before cooking up your account. 🍲",
        "Fill in the blanks, champ — you're almost there!"
    )
    
    val passwordMismatch = listOf(
        "Khaoozy tip: Matching passwords save more snacks than matching socks.",
        "These passwords are on different pages... fix the vibe plz.",
        "Bro, you're one mismatch away from losing your fries to someone else — fix it. 🍟",
        "Passwords aren't twinning — aur tumse ye expected nahi tha."
    )
    
    fun getRandomMessage(pool: List<String>): String {
        return pool.random()
    }
}

// Edge case handling
@Serializable
data class OrderLimits(
    val maxItemQuantity: Int = 5,
    val maxTotalValue: Double = 1000.0,
    val orderCooldownMinutes: Int = 2,
    val pickupTimeoutMinutes: Int = 20
)

@Serializable
enum class UserFlag {
    EXCESSIVE_ORDERS,
    UNPICKED_ORDERS,
    SPAM_BEHAVIOR,
    NONE
}

@Serializable
data class FlaggedUser(
    val userId: String,
    val flag: UserFlag,
    val reason: String,
    val flaggedAt: String,
    val flaggedBy: String // admin id
)
