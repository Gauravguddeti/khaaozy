import { ReactNode, useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  BuildingStorefrontIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  ChartBarIcon, 
  BellIcon, 
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Overview & stats' },
  { name: 'Colleges', href: '/colleges', icon: BuildingOfficeIcon, description: 'Manage colleges' },
  { name: 'Canteens', href: '/canteens', icon: BuildingStorefrontIcon, description: 'Canteen management' },
  { name: 'Users', href: '/users', icon: UsersIcon, description: 'User management' },
  { name: 'Orders', href: '/orders', icon: ShoppingBagIcon, description: 'Order tracking' },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, description: 'Reports & insights' },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch live stats for sidebar
  const { data: todayOrders = 0 } = useQuery({
    queryKey: ['todayOrders'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)
      return count || 0
    }
  })

  const { data: activeUsers = 0 } = useQuery({
    queryKey: ['activeUsers'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  })

  const { data: todayRevenue = 0 } = useQuery({
    queryKey: ['todayRevenue'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', today)
        .eq('status', 'completed')
      
      return data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    }
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to orders page with search filter
      navigate(`/orders?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800/95 backdrop-blur-md pt-5 pb-4 shadow-2xl border-r border-gray-700/50">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-700/50 backdrop-blur-sm hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400 transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-1 flex-col min-h-0 bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 shadow-xl">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 bg-gray-800/90 backdrop-blur-xl shadow-sm border-b border-gray-700/50">
          <button
            type="button"
            className="border-r border-gray-700/50 px-4 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 max-w-md">
              <form onSubmit={handleSearch} className="flex w-full md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-200">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </div>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-gray-700/50 backdrop-blur-sm py-2 pl-10 pr-3 text-gray-100 placeholder:text-gray-400 focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500/50 focus:shadow-lg sm:text-sm sm:leading-6 transition-all duration-200"
                    placeholder="Search orders, users, canteens..."
                    type="search"
                  />
                </div>
              </form>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-xl bg-gray-700/60 backdrop-blur-sm p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 group"
                >
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white flex items-center justify-center font-medium shadow-lg animate-pulse">
                    3
                  </span>
                </button>
                
                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-lg border border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                      <div className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                        <p className="text-sm text-white">New order #1234 received</p>
                        <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                        <p className="text-sm text-white">Low stock alert for menu item</p>
                        <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                        <p className="text-sm text-white">New canteen owner registered</p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <div className="flex items-center space-x-3 bg-gray-700/60 backdrop-blur-sm rounded-xl px-3 py-2 hover:bg-gray-600/80 transition-all duration-200 group cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                      <span className="text-sm font-semibold text-white">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-semibold text-white">
                      {user?.username || 'Admin'}
                    </div>
                    <div className="text-xs text-gray-400">Administrator</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center p-1 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-900">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="fade-in">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )

  function SidebarContent() {
    return (
      <>
        <div className="flex flex-shrink-0 items-center px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <BuildingStorefrontIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                VU Canteen
              </h1>
              <p className="text-sm text-gray-400 font-medium">Admin Dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:scale-[1.01]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl" />
                  )}
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10 ${
                      isActive ? 'text-white drop-shadow-sm' : 'text-gray-400 group-hover:text-blue-400'
                    }`}
                  />
                  <div className="relative z-10">
                    <div className={isActive ? 'text-white' : ''}>{item.name}</div>
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white/30 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* Quick Stats Cards */}
          <div className="mt-8 space-y-4">
            <button 
              onClick={() => navigate('/orders')}
              className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">Today's Orders</p>
                  <p className="text-2xl font-bold">{todayOrders}</p>
                  <p className="text-xs text-white/70 mt-1">Live count</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/analytics')}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">Revenue</p>
                  <p className="text-2xl font-bold">₹{todayRevenue.toLocaleString()}</p>
                  <p className="text-xs text-white/70 mt-1">Today's total</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/users')}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                  <p className="text-xs text-white/70 mt-1">Total registered</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </>
    )
  }
}
