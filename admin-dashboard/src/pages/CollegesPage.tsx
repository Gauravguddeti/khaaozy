import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Plus, MapPin, Phone, Users, Building2, Edit, Trash2 } from 'lucide-react'

interface College {
  id: string
  name: string
  address: string
  phone: string
  email: string
  admin_name: string
  canteen_count?: number
  user_count?: number
  created_at: string
}

export default function CollegesPage() {
  const [_isAddModalOpen, setIsAddModalOpen] = useState(false) // TODO: Implement add college modal

  const { data: colleges, isLoading } = useQuery({
    queryKey: ['colleges'],
    queryFn: async (): Promise<College[]> => {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          *,
          canteens(count),
          users(count)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data?.map(college => ({
        ...college,
        canteen_count: college.canteens?.length || 0,
        user_count: college.users?.length || 0
      })) || []
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600/20 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading colleges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Colleges</h1>
          <p className="text-gray-600 mt-2">
            Manage colleges and their information across the platform
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Add College</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{colleges?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Colleges</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {colleges?.reduce((sum, college) => sum + (college.user_count || 0), 0) || 0}
              </p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {colleges?.reduce((sum, college) => sum + (college.canteen_count || 0), 0) || 0}
              </p>
              <p className="text-sm text-gray-600">Total Canteens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {colleges?.map((college) => (
          <div key={college.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{college.name}</h3>
                  <p className="text-sm text-gray-600">{college.admin_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{college.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{college.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{college.canteen_count}</p>
                <p className="text-xs text-blue-700">Canteens</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-600">{college.user_count}</p>
                <p className="text-xs text-green-700">Users</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {colleges?.length === 0 && (
        <div className="text-center py-12">
          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No colleges found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first college to the platform.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First College</span>
          </button>
        </div>
      )}
    </div>
  )
}
