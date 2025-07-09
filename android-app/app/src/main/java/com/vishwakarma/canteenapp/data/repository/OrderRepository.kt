package com.vishwakarma.canteenapp.data.repository

import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.vishwakarma.canteenapp.data.remote.SupabaseClient
import com.vishwakarma.canteenapp.domain.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor() {
    
    private val client = SupabaseClient.client
    
    // Create order
    suspend fun createOrder(order: Order, orderItems: List<OrderItem>): Result<Order> {
        return try {
            // Insert order
            val createdOrder = client.from("orders")
                .insert(order)
                .decodeSingle<Order>()
            
            // Insert order items
            val orderItemsWithOrderId = orderItems.map { item ->
                OrderItem(
                    menuItemId = item.menuItemId,
                    name = item.name,
                    price = item.price,
                    quantity = item.quantity,
                    specialInstructions = item.specialInstructions
                )
            }
            
            client.from("order_items").insert(orderItemsWithOrderId)
            
            Result.success(createdOrder)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Get user orders
    fun getUserOrders(userId: String): Flow<List<Order>> = flow {
        try {
            val orders = client.from("orders")
                .select()
                .eq("user_id", userId)
                .order("created_at", ascending = false)
                .decodeList<Order>()
            emit(orders)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Get order details with items
    suspend fun getOrderWithItems(orderId: String): Result<Pair<Order, List<OrderItem>>> {
        return try {
            // Get order
            val order = client.from("orders")
                .select()
                .eq("id", orderId)
                .decodeSingle<Order>()
            
            // Get order items
            val orderItems = client.from("order_items")
                .select()
                .eq("order_id", orderId)
                .decodeList<OrderItem>()
            
            Result.success(Pair(order, orderItems))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Update order status (for owners)
    suspend fun updateOrderStatus(orderId: String, status: OrderStatus): Result<Order> {
        return try {
            val updatedOrder = client.from("orders")
                .update(mapOf("status" to status.name.lowercase())) {
                    filter {
                        eq("id", orderId)
                    }
                }
                .decodeSingle<Order>()
            
            Result.success(updatedOrder)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Get canteen orders (for owners)
    fun getCanteenOrders(canteenId: String): Flow<List<Order>> = flow {
        try {
            val orders = client.from("orders")
                .select()
                .eq("canteen_id", canteenId)
                .order("created_at", ascending = false)
                .decodeList<Order>()
            emit(orders)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Get orders by status
    fun getOrdersByStatus(canteenId: String, status: OrderStatus): Flow<List<Order>> = flow {
        try {
            val orders = client.from("orders")
                .select()
                .eq("canteen_id", canteenId)
                .eq("status", status.name.lowercase())
                .order("created_at", ascending = false)
                .decodeList<Order>()
            emit(orders)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Cancel order
    suspend fun cancelOrder(orderId: String): Result<Order> {
        return try {
            val updatedOrder = client.from("orders")
                .update(mapOf("status" to "cancelled")) {
                    filter {
                        eq("id", orderId)
                    }
                }
                .decodeSingle<Order>()
            
            Result.success(updatedOrder)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
