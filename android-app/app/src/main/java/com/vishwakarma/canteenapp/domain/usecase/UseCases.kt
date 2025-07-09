package com.vishwakarma.canteenapp.domain.usecase

import com.vishwakarma.canteenapp.data.repository.AuthRepository
import com.vishwakarma.canteenapp.data.repository.CanteenRepository
import com.vishwakarma.canteenapp.data.repository.OrderRepository
import com.vishwakarma.canteenapp.domain.model.*
import kotlinx.coroutines.flow.Flow

// Auth Use Cases
data class AuthUseCases(
    val signUp: SignUpUseCase,
    val signIn: SignInUseCase,
    val signOut: SignOutUseCase,
    val getCurrentUser: GetCurrentUserUseCase,
    val updateProfile: UpdateProfileUseCase
)

class SignUpUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(email: String, password: String, name: String, collegeId: String): Result<User> {
        return repository.signUp(email, password, name, collegeId)
    }
}

class SignInUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(email: String, password: String): Result<User> {
        return repository.signIn(email, password)
    }
}

class SignOutUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(): Result<Unit> {
        return repository.signOut()
    }
}

class GetCurrentUserUseCase(private val repository: AuthRepository) {
    operator fun invoke(): Flow<User?> {
        return repository.getCurrentUser()
    }
}

class UpdateProfileUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(user: User): Result<User> {
        return repository.updateProfile(user)
    }
}

// Canteen Use Cases
data class CanteenUseCases(
    val getColleges: GetCollegesUseCase,
    val getCanteens: GetCanteensUseCase,
    val getMenuItems: GetMenuItemsUseCase,
    val searchMenuItems: SearchMenuItemsUseCase,
    val getCanteen: GetCanteenUseCase
)

class GetCollegesUseCase(private val repository: CanteenRepository) {
    operator fun invoke(): Flow<List<College>> {
        return repository.getColleges()
    }
}

class GetCanteensUseCase(private val repository: CanteenRepository) {
    operator fun invoke(collegeId: String): Flow<List<Canteen>> {
        return repository.getCanteensByCollege(collegeId)
    }
}

class GetMenuItemsUseCase(private val repository: CanteenRepository) {
    operator fun invoke(canteenId: String): Flow<List<MenuItem>> {
        return repository.getMenuItems(canteenId)
    }
}

class SearchMenuItemsUseCase(private val repository: CanteenRepository) {
    operator fun invoke(canteenId: String, query: String): Flow<List<MenuItem>> {
        return repository.searchMenuItems(canteenId, query)
    }
}

class GetCanteenUseCase(private val repository: CanteenRepository) {
    suspend operator fun invoke(canteenId: String): Result<Canteen> {
        return repository.getCanteen(canteenId)
    }
}

// Order Use Cases
data class OrderUseCases(
    val createOrder: CreateOrderUseCase,
    val getUserOrders: GetUserOrdersUseCase,
    val getOrderDetails: GetOrderDetailsUseCase,
    val updateOrderStatus: UpdateOrderStatusUseCase,
    val cancelOrder: CancelOrderUseCase
)

class CreateOrderUseCase(private val repository: OrderRepository) {
    suspend operator fun invoke(order: Order, orderItems: List<OrderItem>): Result<Order> {
        return repository.createOrder(order, orderItems)
    }
}

class GetUserOrdersUseCase(private val repository: OrderRepository) {
    operator fun invoke(userId: String): Flow<List<Order>> {
        return repository.getUserOrders(userId)
    }
}

class GetOrderDetailsUseCase(private val repository: OrderRepository) {
    suspend operator fun invoke(orderId: String): Result<Pair<Order, List<OrderItem>>> {
        return repository.getOrderWithItems(orderId)
    }
}

class UpdateOrderStatusUseCase(private val repository: OrderRepository) {
    suspend operator fun invoke(orderId: String, status: OrderStatus): Result<Order> {
        return repository.updateOrderStatus(orderId, status)
    }
}

class CancelOrderUseCase(private val repository: OrderRepository) {
    suspend operator fun invoke(orderId: String): Result<Order> {
        return repository.cancelOrder(orderId)
    }
}
