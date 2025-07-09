package com.vishwakarma.canteenapp.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val role: UserRole,
    val collegeId: String?,
    val name: String,
    val phoneNumber: String?,
    val profileImageUrl: String?,
    val isVerified: Boolean = false,
    val createdAt: String,
    val updatedAt: String
)

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
