package com.vishwakarma.canteenapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vishwakarma.canteenapp.data.repository.AuthRepository
import com.vishwakarma.canteenapp.domain.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _signUpState = MutableStateFlow(SignUpUiState())
    val signUpState: StateFlow<SignUpUiState> = _signUpState.asStateFlow()

    private val _loginState = MutableStateFlow(LoginUiState())
    val loginState: StateFlow<LoginUiState> = _loginState.asStateFlow()

    private val _deviceSessions = MutableStateFlow<List<DeviceSession>>(emptyList())
    val deviceSessions: StateFlow<List<DeviceSession>> = _deviceSessions.asStateFlow()

    private val _lastOrderTime = MutableStateFlow<Long?>(null)
    
    // Rate limiting for orders
    private val orderCooldownMs = 2 * 60 * 1000L // 2 minutes

    init {
        checkCurrentUser()
        loadDeviceSessions()
    }

    // AUTHENTICATION METHODS
    fun signIn(identifier: String, password: String) {
        viewModelScope.launch {
            _authState.value = _authState.value.copy(isLoading = true, error = null)
            
            // Allow login with phone OR email
            authRepository.signIn(identifier, password)
                .onSuccess { user ->
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        isAuthenticated = true,
                        currentUser = user
                    )
                }
                .onFailure { exception ->
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Sign in failed"
                    )
                }
        }
    }

    fun signUp(signUpRequest: SignUpRequest) {
        viewModelScope.launch {
            _signUpState.value = _signUpState.value.copy(isLoading = true, error = null)
            
            // Validate all required fields are verified
            if (!_signUpState.value.isPhoneVerified || !_signUpState.value.isEmailVerified) {
                _signUpState.value = _signUpState.value.copy(
                    isLoading = false,
                    error = MessagePools.getRandomMessage(MessagePools.missingFields)
                )
                return@launch
            }
            
            authRepository.signUp(signUpRequest)
                .onSuccess { user ->
                    _authState.value = _authState.value.copy(
                        isAuthenticated = true,
                        currentUser = user
                    )
                    _signUpState.value = _signUpState.value.copy(
                        isLoading = false,
                        isSignUpComplete = true,
                        successMessage = MessagePools.getRandomMessage(MessagePools.signupSuccess)
                    )
                }
                .onFailure { exception ->
                    _signUpState.value = _signUpState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Sign up failed"
                    )
                }
        }
    }
            
            authRepository.signUp(email, password, fullName, collegeId, role)
                .onSuccess { user ->
                    _currentUser.value = user
                    _uiState.value = _uiState.value.copy(isLoading = false, isAuthenticated = true)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Sign up failed"
                    )
                }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
                .onSuccess {
                    _currentUser.value = null
                    _uiState.value = AuthUiState(isAuthenticated = false)
                }
        }
    }

    // OTP VERIFICATION METHODS
    fun sendPhoneOtp(phoneNumber: String) {
        viewModelScope.launch {
            _signUpState.value = _signUpState.value.copy(isLoadingPhoneOtp = true)
            
            authRepository.sendPhoneOtp(phoneNumber)
                .onSuccess {
                    _signUpState.value = _signUpState.value.copy(
                        isLoadingPhoneOtp = false,
                        isPhoneOtpSent = true,
                        phoneNumber = phoneNumber
                    )
                }
                .onFailure { exception ->
                    _signUpState.value = _signUpState.value.copy(
                        isLoadingPhoneOtp = false,
                        error = exception.message ?: "Failed to send phone OTP"
                    )
                }
        }
    }

    fun verifyPhoneOtp(otp: String) {
        viewModelScope.launch {
            _signUpState.value = _signUpState.value.copy(isVerifyingPhoneOtp = true)
            
            authRepository.verifyPhoneOtp(_signUpState.value.phoneNumber, otp)
                .onSuccess {
                    _signUpState.value = _signUpState.value.copy(
                        isVerifyingPhoneOtp = false,
                        isPhoneVerified = true
                    )
                }
                .onFailure { exception ->
                    _signUpState.value = _signUpState.value.copy(
                        isVerifyingPhoneOtp = false,
                        error = exception.message ?: "Invalid phone OTP"
                    )
                }
        }
    }

    fun sendEmailOtp(email: String) {
        viewModelScope.launch {
            _signUpState.value = _signUpState.value.copy(isLoadingEmailOtp = true)
            
            authRepository.sendEmailOtp(email)
                .onSuccess {
                    _signUpState.value = _signUpState.value.copy(
                        isLoadingEmailOtp = false,
                        isEmailOtpSent = true,
                        email = email
                    )
                }
                .onFailure { exception ->
                    _signUpState.value = _signUpState.value.copy(
                        isLoadingEmailOtp = false,
                        error = exception.message ?: "Failed to send email OTP"
                    )
                }
        }
    }

    fun verifyEmailOtp(otp: String) {
        viewModelScope.launch {
            _signUpState.value = _signUpState.value.copy(isVerifyingEmailOtp = true)
            
            authRepository.verifyEmailOtp(_signUpState.value.email, otp)
                .onSuccess {
                    _signUpState.value = _signUpState.value.copy(
                        isVerifyingEmailOtp = false,
                        isEmailVerified = true
                    )
                }
                .onFailure { exception ->
                    _signUpState.value = _signUpState.value.copy(
                        isVerifyingEmailOtp = false,
                        error = exception.message ?: "Invalid email OTP"
                    )
                }
        }
    }

    // VALIDATION METHODS
    fun validatePasswordMatch(password: String, confirmPassword: String): ValidationResult {
        return if (password == confirmPassword) {
            ValidationResult(isValid = true)
        } else {
            ValidationResult(
                isValid = false, 
                errorMessage = MessagePools.getRandomMessage(MessagePools.passwordMismatch)
            )
        }
    }

    fun validateRequiredFields(
        firstName: String,
        lastName: String,
        phoneNumber: String,
        email: String,
        password: String,
        confirmPassword: String
    ): ValidationResult {
        if (firstName.isBlank() || lastName.isBlank() || phoneNumber.isBlank() || 
            email.isBlank() || password.isBlank() || confirmPassword.isBlank()) {
            return ValidationResult(
                isValid = false,
                errorMessage = MessagePools.getRandomMessage(MessagePools.missingFields)
            )
        }
        
        if (password.length < 6) {
            return ValidationResult(isValid = false, errorMessage = "Password must be at least 6 characters")
        }
        
        return validatePasswordMatch(password, confirmPassword)
    }

    fun canCreateAccount(): Boolean {
        return _signUpState.value.isPhoneVerified && _signUpState.value.isEmailVerified
    }

    // ORDER RATE LIMITING (Edge case handling)
    fun canPlaceOrder(): Boolean {
        val lastOrder = _lastOrderTime.value
        return if (lastOrder == null) {
            true
        } else {
            System.currentTimeMillis() - lastOrder > orderCooldownMs
        }
    }

    fun recordOrderTime() {
        _lastOrderTime.value = System.currentTimeMillis()
    }

    fun getRemainingCooldownSeconds(): Int {
        val lastOrder = _lastOrderTime.value ?: return 0
        val elapsed = System.currentTimeMillis() - lastOrder
        val remaining = (orderCooldownMs - elapsed) / 1000
        return maxOf(0, remaining.toInt())
    }

    // SESSION MANAGEMENT
    private fun loadDeviceSessions() {
        viewModelScope.launch {
            authRepository.getDeviceSessions()
                .onSuccess { sessions ->
                    _deviceSessions.value = sessions
                }
                .onFailure {
                    // Handle error silently for sessions
                }
        }
    }

    // EMAIL DOMAIN VALIDATION (Future feature - commented)
    // private fun isEmailDomainAllowed(email: String): Boolean {
    //     val allowedDomains = listOf("@vupune.ac.in") // Will be configurable
    //     return allowedDomains.any { domain =>
    //         email.lowercase().endsWith(domain.lowercase())
    //     }
    // }

    private fun checkCurrentUser() {
        viewModelScope.launch {
            authRepository.getCurrentUser()
                .onSuccess { user ->
                    _authState.value = _authState.value.copy(
                        isAuthenticated = true,
                        currentUser = user
                    )
                }
                .onFailure {
                    _authState.value = _authState.value.copy(isAuthenticated = false)
                }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
            _authState.value = AuthState()
            _signUpState.value = SignUpUiState()
            _loginState.value = LoginUiState()
        }
    }

    fun clearError() {
        _authState.value = _authState.value.copy(error = null)
        _signUpState.value = _signUpState.value.copy(error = null)
        _loginState.value = _loginState.value.copy(error = null)
    }

    fun resetSignUpState() {
        _signUpState.value = SignUpUiState()
    }
}

// UI State classes
data class SignUpUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
    val phoneNumber: String = "",
    val email: String = "",
    val isPhoneOtpSent: Boolean = false,
    val isEmailOtpSent: Boolean = false,
    val isLoadingPhoneOtp: Boolean = false,
    val isLoadingEmailOtp: Boolean = false,
    val isVerifyingPhoneOtp: Boolean = false,
    val isVerifyingEmailOtp: Boolean = false,
    val isPhoneVerified: Boolean = false,
    val isEmailVerified: Boolean = false,
    val isSignUpComplete: Boolean = false
)

data class LoginUiState(
    val isLoading: Boolean = false,
    val error: String? = null
)
