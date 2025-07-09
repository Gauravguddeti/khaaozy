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
    
    suspend fun signUp(signUpRequest: SignUpRequest): Result<User> {
        return try {
            // Sign up with Supabase Auth
            val authResult = client.auth.signUpWith(Email) {
                this.email = signUpRequest.email
                this.password = signUpRequest.password
            }
            
            val userId = authResult.user?.id ?: throw Exception("Failed to get user ID")
            
            // Extract college name from email domain
            val collegeName = extractCollegeFromEmail(signUpRequest.email)
            
            // Create user profile with new structure
            val user = User(
                id = userId,
                email = signUpRequest.email,
                role = UserRole.USER,
                collegeId = null, // Will be assigned based on email domain
                firstName = signUpRequest.firstName,
                lastName = signUpRequest.lastName,
                phoneNumber = signUpRequest.phoneNumber,
                profileImageUrl = signUpRequest.profileImageUrl,
                studentIdPhotoUrl = signUpRequest.studentIdPhotoUrl,
                classBatch = signUpRequest.classBatch,
                isPhoneVerified = true, // Already verified in signup flow
                isEmailVerified = true, // Already verified in signup flow
                isVerified = true,
                collegeName = collegeName,
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

    suspend fun signIn(identifier: String, password: String): Result<User> {
        return try {
            // Try to sign in (identifier can be email or phone)
            val authResult = client.auth.signInWith(Email) {
                this.email = identifier // For now, treat as email. TODO: Handle phone login
                this.password = password
            }
            
            val userId = authResult.user?.id ?: throw Exception("Failed to get user ID")
            
            // Fetch user profile from our users table
            val userProfile = client.from("users")
                .select()
                .eq("id", userId)
                .decodeSingle<User>()
                
            Result.success(userProfile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // OTP METHODS
    suspend fun sendPhoneOtp(phoneNumber: String): Result<Unit> {
        return try {
            // TODO: Implement actual SMS OTP service integration
            // For now, simulate success
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyPhoneOtp(phoneNumber: String, otp: String): Result<Unit> {
        return try {
            // TODO: Implement actual OTP verification
            // For demo purposes, accept "123456" as valid OTP
            if (otp == "123456") {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Invalid OTP"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendEmailOtp(email: String): Result<Unit> {
        return try {
            // TODO: Implement actual email OTP service
            // For now, simulate success
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyEmailOtp(email: String, otp: String): Result<Unit> {
        return try {
            // TODO: Implement actual OTP verification
            // For demo purposes, accept "123456" as valid OTP
            if (otp == "123456") {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Invalid OTP"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // DEVICE SESSION METHODS
    suspend fun getDeviceSessions(): Result<List<DeviceSession>> {
        return try {
            // TODO: Implement actual device session tracking
            // For now, return mock data
            val mockSessions = listOf(
                DeviceSession(
                    id = "1",
                    userId = getCurrentUser().getOrNull()?.id ?: "",
                    deviceName = "Current Android Device",
                    deviceType = "Android",
                    loginTime = "2024-01-10 10:30:00",
                    lastActiveTime = "Just now",
                    isCurrentDevice = true
                ),
                DeviceSession(
                    id = "2",
                    userId = getCurrentUser().getOrNull()?.id ?: "",
                    deviceName = "Chrome Browser",
                    deviceType = "Web",
                    loginTime = "2024-01-09 15:45:00",
                    lastActiveTime = "2 hours ago",
                    isCurrentDevice = false
                )
            )
            Result.success(mockSessions)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCurrentUser(): Result<User?> {
        return try {
            val currentSession = client.auth.currentSessionOrNull()
            if (currentSession != null) {
                val userId = currentSession.user?.id ?: return Result.success(null)
                
                val userProfile = client.from("users")
                    .select()
                    .eq("id", userId)
                    .decodeSingle<User>()
                    
                Result.success(userProfile)
            } else {
                Result.success(null)
            }
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

    // HELPER METHODS
    private fun extractCollegeFromEmail(email: String): String? {
        return when {
            email.endsWith("@vupune.ac.in") -> "Vishwakarma University Pune"
            email.endsWith("@student.vupune.ac.in") -> "Vishwakarma University Pune"
            // Add more college domains as needed
            else -> null
        }
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
