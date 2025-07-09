import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Plus, Store, Clock, Users, MapPin, Phone, Edit, Trash2, Eye } from 'lucide-react'

interface Canteen {
  id: string
  name: string
  description: string
  is_open: boolean
  opening_time: string
  closing_time: string
  contact_number: string
  location: string
  college: { name: string }
  menu_items_count?: number
  orders_count?: number
  rating?: number
  created_at: string
}

export default function CanteensPage() {
  const [_isAddModalOpen, setIsAddModalOpen] = useState(false) // TODO: Implement add canteen modal
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all')

  const { data: canteens, isLoading } = useQuery({
    queryKey: ['canteens', filterStatus],
    queryFn: async (): Promise<Canteen[]> => {
      let query = supabase
        .from('canteens')
        .select(`
          *,
          colleges(name),
          menu_items(count),
          orders(count)
        `)
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('is_open', filterStatus === 'open')
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data?.map(canteen => ({
        ...canteen,
        college: canteen.colleges,
        menu_items_count: canteen.menu_items?.length || 0,
        orders_count: canteen.orders?.length || 0,
        rating: 4.2 + Math.random() * 0.8 // Mock rating
      })) || []
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const openCanteens = canteens?.filter(c => c.is_open).length || 0
  const totalCanteens = canteens?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-600 bg-clip-text text-transparent">
            Canteens Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage canteens across all colleges with real-time status updates
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Add Canteen</span>
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{totalCanteens}</p>
                <p className="text-sm text-gray-600">Total Canteens</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{openCanteens}</p>
                <p className="text-sm text-gray-600">Currently Open</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {canteens?.reduce((sum, canteen) => sum + (canteen.orders_count || 0), 0) || 0}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'open' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'closed' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Canteens Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {canteens?.map((canteen) => (
          <div key={canteen.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{canteen.name}</h3>
                  <p className="text-sm text-gray-600">{canteen.college?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                canteen.is_open 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  canteen.is_open ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {canteen.is_open ? 'Open' : 'Closed'}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{canteen.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{canteen.opening_time} - {canteen.closing_time}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{canteen.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{canteen.contact_number}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-blue-600">{canteen.menu_items_count}</p>
                <p className="text-xs text-blue-700">Menu Items</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-green-600">{canteen.orders_count}</p>
                <p className="text-xs text-green-700">Orders</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-yellow-600">{canteen.rating?.toFixed(1)}</p>
                <p className="text-xs text-yellow-700">Rating</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canteens?.length === 0 && (
        <div className="text-center py-12">
          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No canteens found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first canteen to the platform.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Canteen</span>
          </button>
        </div>
      )}
    </div>
  )
}
