package com.vishwakarma.canteenapp.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import com.vishwakarma.canteenapp.data.repository.*
import com.vishwakarma.canteenapp.domain.usecase.*
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideAuthRepository(): AuthRepository {
        return AuthRepository()
    }
    
    @Provides
    @Singleton
    fun provideCanteenRepository(): CanteenRepository {
        return CanteenRepository()
    }
    
    @Provides
    @Singleton
    fun provideOrderRepository(): OrderRepository {
        return OrderRepository()
    }
    
    @Provides
    @Singleton
    fun provideAuthUseCases(repository: AuthRepository): AuthUseCases {
        return AuthUseCases(
            signUp = SignUpUseCase(repository),
            signIn = SignInUseCase(repository),
            signOut = SignOutUseCase(repository),
            getCurrentUser = GetCurrentUserUseCase(repository),
            updateProfile = UpdateProfileUseCase(repository)
        )
    }
    
    @Provides
    @Singleton
    fun provideCanteenUseCases(repository: CanteenRepository): CanteenUseCases {
        return CanteenUseCases(
            getColleges = GetCollegesUseCase(repository),
            getCanteens = GetCanteensUseCase(repository),
            getMenuItems = GetMenuItemsUseCase(repository),
            searchMenuItems = SearchMenuItemsUseCase(repository),
            getCanteen = GetCanteenUseCase(repository)
        )
    }
    
    @Provides
    @Singleton
    fun provideOrderUseCases(repository: OrderRepository): OrderUseCases {
        return OrderUseCases(
            createOrder = CreateOrderUseCase(repository),
            getUserOrders = GetUserOrdersUseCase(repository),
            getOrderDetails = GetOrderDetailsUseCase(repository),
            updateOrderStatus = UpdateOrderStatusUseCase(repository),
            cancelOrder = CancelOrderUseCase(repository)
        )
    }
}
