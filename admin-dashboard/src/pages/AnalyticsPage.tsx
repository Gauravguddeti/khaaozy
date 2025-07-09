import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Star, Calendar, Download } from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  topCanteens: Array<{
    name: string
    revenue: number
    orders: number
    rating: number
  }>
  revenueByDate: Array<{
    date: string
    revenue: number
    orders: number
  }>
  popularItems: Array<{
    name: string
    orders: number
    revenue: number
    canteen: string
  }>
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('week')

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Fetch real analytics data from Supabase
      try {
        // Get total revenue and orders
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, created_at, status')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        const completedOrders = orders?.filter(order => order.status === 'completed') || []
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0)
        const totalOrders = orders?.length || 0
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Get top canteens
        const { data: canteensData } = await supabase
          .from('canteens')
          .select(`
            id, name, rating,
            orders!inner(total_amount, status)
          `)
          .eq('orders.status', 'completed')

        const topCanteens = canteensData?.map(canteen => {
          const canteenOrders = canteen.orders || []
          const revenue = canteenOrders.reduce((sum: number, order: any) => sum + order.total_amount, 0)
          return {
            name: canteen.name,
            revenue,
            orders: canteenOrders.length,
            rating: canteen.rating || 0
          }
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 4) || []

        // Get revenue by date (last 7 days)
        const revenueByDate: Array<{date: string, revenue: number, orders: number}> = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          
          const dayOrders = orders?.filter(order => 
            order.created_at.startsWith(dateStr) && order.status === 'completed'
          ) || []
          
          revenueByDate.push({
            date: dateStr,
            revenue: dayOrders.reduce((sum, order) => sum + order.total_amount, 0),
            orders: dayOrders.length
          })
        }

        // Get popular items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select(`
            name, price, quantity,
            orders!inner(status),
            menu_items!inner(name, canteen_id),
            canteens!inner(name)
          `)
          .eq('orders.status', 'completed')

        const itemStats: { [key: string]: { orders: number, revenue: number, canteen: string } } = {}
        
        orderItems?.forEach((item: any) => {
          const itemName = item.menu_items?.name || item.name
          const canteenName = item.canteens?.name || 'Unknown'
          
          if (!itemStats[itemName]) {
            itemStats[itemName] = { orders: 0, revenue: 0, canteen: canteenName }
          }
          
          itemStats[itemName].orders += item.quantity
          itemStats[itemName].revenue += item.price * item.quantity
        })

        const popularItems = Object.entries(itemStats)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 5)

        return {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          topCanteens,
          revenueByDate,
          popularItems
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        return {
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          topCanteens: [],
          revenueByDate: [],
          popularItems: []
        }
      }
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600/20 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-600 bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-gray-600 mt-2">
            Track performance, trends, and key metrics across your canteen network
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{analytics?.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.totalOrders.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium text-blue-600">+8.3%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">₹{analytics?.avgOrderValue.toFixed(0)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-purple-600">+3.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Customer Satisfaction</p>
              <p className="text-3xl font-bold text-gray-900">4.7</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium text-yellow-600">Excellent</span>
                <span className="text-sm text-gray-500 ml-1">avg rating</span>
              </div>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Star className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue Trends</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Last 7 days</span>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-700 font-medium mb-2">Interactive Revenue Chart</p>
              <p className="text-sm text-gray-500">Chart library integration coming soon</p>
              <p className="text-xs text-gray-400 mt-2">Will display daily revenue trends with interactive tooltips</p>
            </div>
          </div>
        </div>

        {/* Top Performing Canteens */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Canteens</h3>
          <div className="space-y-4">
            {analytics?.topCanteens.map((canteen, index) => (
              <div key={canteen.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                    'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{canteen.name}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-600">{canteen.orders} orders</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{canteen.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{canteen.revenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600 font-medium">+15% growth</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Most Popular Items</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all items</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics?.popularItems.map((item, index) => (
            <div key={item.name} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  index < 3 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {item.canteen}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Orders</span>
                  <span className="text-sm font-medium text-gray-900">{item.orders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-sm font-medium text-gray-900">₹{item.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
