package com.vishwakarma.canteenapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vishwakarma.canteenapp.data.repository.CanteenRepository
import com.vishwakarma.canteenapp.domain.model.Canteen
import com.vishwakarma.canteenapp.domain.model.MenuCategory
import com.vishwakarma.canteenapp.domain.model.MenuItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CanteenViewModel @Inject constructor(
    private val canteenRepository: CanteenRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CanteenUiState())
    val uiState: StateFlow<CanteenUiState> = _uiState.asStateFlow()

    private val _canteens = MutableStateFlow<List<Canteen>>(emptyList())
    val canteens: StateFlow<List<Canteen>> = _canteens.asStateFlow()

    private val _selectedCanteen = MutableStateFlow<Canteen?>(null)
    val selectedCanteen: StateFlow<Canteen?> = _selectedCanteen.asStateFlow()

    private val _menuCategories = MutableStateFlow<List<MenuCategory>>(emptyList())
    val menuCategories: StateFlow<List<MenuCategory>> = _menuCategories.asStateFlow()

    private val _menuItems = MutableStateFlow<List<MenuItem>>(emptyList())
    val menuItems: StateFlow<List<MenuItem>> = _menuItems.asStateFlow()

    fun loadCanteens(collegeId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            canteenRepository.getCanteensByCollege(collegeId)
                .onSuccess { canteenList ->
                    _canteens.value = canteenList
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Failed to load canteens"
                    )
                }
        }
    }

    fun selectCanteen(canteen: Canteen) {
        _selectedCanteen.value = canteen
        loadMenu(canteen.id)
    }

    fun loadMenu(canteenId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingMenu = true)
            
            // Load menu categories
            canteenRepository.getMenuCategories(canteenId)
                .onSuccess { categories ->
                    _menuCategories.value = categories
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        error = exception.message ?: "Failed to load menu categories"
                    )
                }

            // Load menu items
            canteenRepository.getMenuItems(canteenId)
                .onSuccess { items ->
                    _menuItems.value = items
                    _uiState.value = _uiState.value.copy(isLoadingMenu = false)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoadingMenu = false,
                        error = exception.message ?: "Failed to load menu items"
                    )
                }
        }
    }

    fun searchMenuItems(query: String): List<MenuItem> {
        return if (query.isBlank()) {
            _menuItems.value
        } else {
            _menuItems.value.filter { item ->
                item.name.contains(query, ignoreCase = true) ||
                item.description?.contains(query, ignoreCase = true) == true
            }
        }
    }

    fun getItemsByCategory(categoryId: String): List<MenuItem> {
        return _menuItems.value.filter { it.categoryId == categoryId }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class CanteenUiState(
    val isLoading: Boolean = false,
    val isLoadingMenu: Boolean = false,
    val error: String? = null
)
