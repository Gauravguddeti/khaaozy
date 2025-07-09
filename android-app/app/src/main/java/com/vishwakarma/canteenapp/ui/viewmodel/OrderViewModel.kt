package com.vishwakarma.canteenapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vishwakarma.canteenapp.data.repository.OrderRepository
import com.vishwakarma.canteenapp.domain.model.Order
import com.vishwakarma.canteenapp.domain.model.OrderItem
import com.vishwakarma.canteenapp.domain.model.OrderStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrderViewModel @Inject constructor(
    private val orderRepository: OrderRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderUiState())
    val uiState: StateFlow<OrderUiState> = _uiState.asStateFlow()

    private val _currentOrder = MutableStateFlow<Order?>(null)
    val currentOrder: StateFlow<Order?> = _currentOrder.asStateFlow()

    private val _orderHistory = MutableStateFlow<List<Order>>(emptyList())
    val orderHistory: StateFlow<List<Order>> = _orderHistory.asStateFlow()

    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    fun addToCart(menuItemId: String, name: String, price: Double, imageUrl: String? = null) {
        val currentItems = _cartItems.value.toMutableList()
        val existingItem = currentItems.find { it.menuItemId == menuItemId }
        
        if (existingItem != null) {
            val index = currentItems.indexOf(existingItem)
            currentItems[index] = existingItem.copy(quantity = existingItem.quantity + 1)
        } else {
            currentItems.add(
                CartItem(
                    menuItemId = menuItemId,
                    name = name,
                    price = price,
                    quantity = 1,
                    imageUrl = imageUrl
                )
            )
        }
        
        _cartItems.value = currentItems
    }

    fun removeFromCart(menuItemId: String) {
        val currentItems = _cartItems.value.toMutableList()
        val existingItem = currentItems.find { it.menuItemId == menuItemId }
        
        if (existingItem != null) {
            if (existingItem.quantity > 1) {
                val index = currentItems.indexOf(existingItem)
                currentItems[index] = existingItem.copy(quantity = existingItem.quantity - 1)
            } else {
                currentItems.removeAll { it.menuItemId == menuItemId }
            }
        }
        
        _cartItems.value = currentItems
    }

    fun clearCart() {
        _cartItems.value = emptyList()
    }

    fun getTotalAmount(): Double {
        return _cartItems.value.sumOf { it.price * it.quantity }
    }

    fun getItemCount(): Int {
        return _cartItems.value.sumOf { it.quantity }
    }

    fun placeOrder(
        canteenId: String,
        orderType: String,
        notes: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isPlacingOrder = true)
            
            val orderItems = _cartItems.value.map { cartItem ->
                OrderItem(
                    menuItemId = cartItem.menuItemId,
                    quantity = cartItem.quantity,
                    price = cartItem.price,
                    name = cartItem.name
                )
            }
            
            orderRepository.createOrder(
                canteenId = canteenId,
                orderItems = orderItems,
                totalAmount = getTotalAmount(),
                orderType = orderType,
                notes = notes
            )
                .onSuccess { order ->
                    _currentOrder.value = order
                    clearCart()
                    _uiState.value = _uiState.value.copy(
                        isPlacingOrder = false,
                        orderPlaced = true
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isPlacingOrder = false,
                        error = exception.message ?: "Failed to place order"
                    )
                }
        }
    }

    fun loadOrderHistory(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            orderRepository.getUserOrders(userId)
                .onSuccess { orders ->
                    _orderHistory.value = orders
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Failed to load order history"
                    )
                }
        }
    }

    fun loadCurrentOrder(orderId: String) {
        viewModelScope.launch {
            orderRepository.getOrder(orderId)
                .onSuccess { order ->
                    _currentOrder.value = order
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        error = exception.message ?: "Failed to load order"
                    )
                }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun resetOrderPlaced() {
        _uiState.value = _uiState.value.copy(orderPlaced = false)
    }
}

data class OrderUiState(
    val isLoading: Boolean = false,
    val isPlacingOrder: Boolean = false,
    val orderPlaced: Boolean = false,
    val error: String? = null
)

data class CartItem(
    val menuItemId: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val imageUrl: String? = null
)
