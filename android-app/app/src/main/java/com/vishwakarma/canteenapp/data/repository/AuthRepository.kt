package com.vishwakarma.canteenapp.data.repository

import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.vishwakarma.canteenapp.data.remote.SupabaseClient
import com.vishwakarma.canteenapp.domain.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor() {
    
    private val client = SupabaseClient.client
    
    suspend fun signUp(email: String, password: String, name: String, collegeId: String): Result<User> {
        return try {
            // Sign up with Supabase Auth
            val authResult = client.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
            
            val userId = authResult.user?.id ?: throw Exception("Failed to get user ID")
            
            // Create user profile
            val user = User(
                id = userId,
                email = email,
                role = UserRole.USER,
                collegeId = collegeId,
                name = name,
                phoneNumber = null,
                profileImageUrl = null,
                isVerified = false,
                createdAt = "",
                updatedAt = ""
            )
            
            // Insert user data into our users table
            client.from("users").insert(user)
            
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signIn(email: String, password: String): Result<User> {
        return try {
            // Sign in with Supabase Auth
            client.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            
            // Get user profile
            val userProfile = client.from("users")
                .select()
                .eq("email", email)
                .decodeSingle<User>()
            
            Result.success(userProfile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signOut(): Result<Unit> {
        return try {
            client.auth.signOut()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getCurrentUser(): Flow<User?> = flow {
        try {
            val session = client.auth.currentSessionOrNull()
            if (session != null) {
                val userProfile = client.from("users")
                    .select()
                    .eq("id", session.user?.id ?: "")
                    .decodeSingle<User>()
                emit(userProfile)
            } else {
                emit(null)
            }
        } catch (e: Exception) {
            emit(null)
        }
    }
    
    suspend fun updateProfile(user: User): Result<User> {
        return try {
            val updatedUser = client.from("users")
                .update(user) {
                    filter {
                        eq("id", user.id)
                    }
                }
                .decodeSingle<User>()
            
            Result.success(updatedUser)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
