import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BarChart3, Users, ShoppingBag, Store, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalCanteens: number
  totalOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
  activeCanteens: number
  pendingOrders: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date().toISOString().split('T')[0]
      
      try {
        // Get total counts
        const [usersCount, canteensCount, ordersCount, revenueSum, todayOrdersCount, todayRevenueSum, activeCanteensCount, pendingOrdersCount] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('canteens').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount').eq('status', 'DELIVERED'),
          supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('orders').select('total_amount').eq('status', 'DELIVERED').gte('created_at', today),
          supabase.from('canteens').select('id', { count: 'exact', head: true }).eq('is_open', true),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'PENDING')
        ])

        return {
          totalUsers: usersCount.count || 0,
          totalCanteens: canteensCount.count || 0,
          totalOrders: ordersCount.count || 0,
          totalRevenue: revenueSum.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
          todayOrders: todayOrdersCount.count || 0,
          todayRevenue: todayRevenueSum.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
          activeCanteens: activeCanteensCount.count || 0,
          pendingOrders: pendingOrdersCount.count || 0
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        // Return empty data if Supabase fails
        return {
          totalUsers: 0,
          totalCanteens: 0,
          totalOrders: 0,
          totalRevenue: 0,
          todayOrders: 0,
          todayRevenue: 0,
          activeCanteens: 0,
          pendingOrders: 0
        }
      }
    }
  })

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            users(full_name),
            canteens(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (error) throw error
        
        // If no data, return empty array
        if (!data || data.length === 0) {
          return []
        }
        
        return data || []
      } catch (error) {
        console.error('Error fetching recent orders:', error)
        return []
      }
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: `${stats?.totalUsers || 0} registered`,
      changeType: 'neutral' as const,
      description: 'Students, faculty & staff'
    },
    {
      title: 'Active Canteens',
      value: stats?.activeCanteens || 0,
      icon: Store,
      change: `${stats?.totalCanteens || 0} total`,
      changeType: 'neutral' as const,
      description: 'Currently serving'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      change: `${stats?.todayOrders || 0} today`,
      changeType: 'positive' as const,
      description: 'All time orders'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: BarChart3,
      change: `₹${(stats?.todayRevenue || 0).toLocaleString()} today`,
      changeType: 'positive' as const,
      description: 'Total earnings'
    }
  ]

  return (
    <div className="space-y-8 bg-gray-900 min-h-screen">
      {/* Header with Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-8 text-white shadow-xl border border-gray-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, Admin! 👋</h1>
          <p className="text-gray-300 text-lg">
            Here's what's happening at your canteens today. You're doing great!
          </p>
          <div className="mt-6 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">All systems operational</span>
            </div>
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5"></div>
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {stat.changeType === 'positive' && <TrendingUp className="h-4 w-4 text-green-400" />}
                  {stat.changeType === 'neutral' && <TrendingUp className="h-4 w-4 text-blue-400" />}
                  <span className={`text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-green-400' : 
                    stat.changeType === 'neutral' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-medium">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/canteens')}
              className="w-full group text-left p-4 rounded-xl border border-gray-600 hover:border-blue-500 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors border border-orange-500/40">
                  <svg className="h-4 w-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Add New Canteen</div>
                  <div className="text-sm text-gray-400">Register a new canteen location</div>
                </div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/users')}
              className="w-full group text-left p-4 rounded-xl border border-gray-600 hover:border-blue-500 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-blue-800/50 transition-colors border border-blue-800">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">Manage Users</div>
                  <div className="text-sm text-gray-400">View and edit user accounts</div>
                </div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/analytics')}
              className="w-full group text-left p-4 rounded-xl border border-gray-600 hover:border-purple-500 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-900/50 rounded-lg flex items-center justify-center group-hover:bg-purple-800/50 transition-colors border border-purple-800">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">View Analytics</div>
                  <div className="text-sm text-gray-400">Detailed reports and insights</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Recent Orders</h3>
            </div>
            <button 
              onClick={() => navigate('/orders')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View all
            </button>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 transition-colors duration-200 border border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {((order as any).users?.full_name || 'U').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {(order as any).users?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {(order as any).canteens?.name || 'Unknown Canteen'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">₹{order.total_amount}</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                      order.status === 'PREPARING' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                      order.status === 'PENDING' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                      'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {order.status?.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-300 font-medium">No recent orders</p>
              <p className="text-sm text-gray-500 mt-1">Orders will appear here when customers start ordering</p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {stats && stats.pendingOrders > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                ⚠️ Attention Required
              </h3>
              <p className="text-white/90">
                You have <span className="font-bold">{stats.pendingOrders}</span> pending orders that need immediate attention.
              </p>
              <button className="mt-4 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 backdrop-blur-sm">
                View Pending Orders
              </button>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-white/5"></div>
        </div>
      )}
    </div>
  )
}
