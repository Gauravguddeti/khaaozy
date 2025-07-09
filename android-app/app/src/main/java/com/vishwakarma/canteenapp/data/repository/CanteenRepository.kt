package com.vishwakarma.canteenapp.data.repository

import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.vishwakarma.canteenapp.data.remote.SupabaseClient
import com.vishwakarma.canteenapp.domain.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CanteenRepository @Inject constructor() {
    
    private val client = SupabaseClient.client
    
    // Get colleges
    fun getColleges(): Flow<List<College>> = flow {
        try {
            val colleges = client.from("colleges")
                .select()
                .eq("is_active", true)
                .decodeList<College>()
            emit(colleges)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Get canteens by college
    fun getCanteensByCollege(collegeId: String): Flow<List<Canteen>> = flow {
        try {
            val canteens = client.from("canteens")
                .select()
                .eq("college_id", collegeId)
                .decodeList<Canteen>()
            emit(canteens)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Get menu items by canteen
    fun getMenuItems(canteenId: String): Flow<List<MenuItem>> = flow {
        try {
            val menuItems = client.from("menu_items")
                .select()
                .eq("canteen_id", canteenId)
                .eq("is_available", true)
                .decodeList<MenuItem>()
            emit(menuItems)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Get menu items by category
    fun getMenuItemsByCategory(canteenId: String, category: FoodCategory): Flow<List<MenuItem>> = flow {
        try {
            val menuItems = client.from("menu_items")
                .select()
                .eq("canteen_id", canteenId)
                .eq("category", category.name.lowercase())
                .eq("is_available", true)
                .decodeList<MenuItem>()
            emit(menuItems)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Search menu items
    fun searchMenuItems(canteenId: String, query: String): Flow<List<MenuItem>> = flow {
        try {
            val menuItems = client.from("menu_items")
                .select()
                .eq("canteen_id", canteenId)
                .ilike("name", "%$query%")
                .eq("is_available", true)
                .decodeList<MenuItem>()
            emit(menuItems)
        } catch (e: Exception) {
            emit(emptyList())
        }
    }
    
    // Get single canteen
    suspend fun getCanteen(canteenId: String): Result<Canteen> {
        return try {
            val canteen = client.from("canteens")
                .select()
                .eq("id", canteenId)
                .decodeSingle<Canteen>()
            Result.success(canteen)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Get single menu item
    suspend fun getMenuItem(menuItemId: String): Result<MenuItem> {
        return try {
            val menuItem = client.from("menu_items")
                .select()
                .eq("id", menuItemId)
                .decodeSingle<MenuItem>()
            Result.success(menuItem)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
