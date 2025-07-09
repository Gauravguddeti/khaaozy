import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function VerifyResetCodePage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => {
    // Check if there's a reset code in localStorage
    const storedCode = localStorage.getItem('resetCode')
    const timestamp = localStorage.getItem('resetCodeTimestamp')
    
    if (!storedCode || !timestamp) {
      navigate('/forgot-password')
      return
    }

    // Check if code has expired (5 minutes)
    const now = Date.now()
    const codeAge = now - parseInt(timestamp)
    if (codeAge > 300000) { // 5 minutes in milliseconds
      localStorage.removeItem('resetCode')
      localStorage.removeItem('resetCodeTimestamp')
      localStorage.removeItem('resetEmail')
      setError('Verification code has expired. Please request a new one.')
      return
    }

    // Update countdown timer
    const timer = setInterval(() => {
      const remaining = Math.max(0, 300000 - (Date.now() - parseInt(timestamp)))
      setTimeLeft(Math.floor(remaining / 1000))
      
      if (remaining <= 0) {
        clearInterval(timer)
        localStorage.removeItem('resetCode')
        localStorage.removeItem('resetCodeTimestamp')
        localStorage.removeItem('resetEmail')
        setError('Verification code has expired. Please request a new one.')
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const storedCode = localStorage.getItem('resetCode')
    // const storedEmail = localStorage.getItem('resetEmail') // TODO: Use for verification

    if (code === storedCode) {
      // Code is correct, auto-login user
      login({
        id: 'admin-reset',
        username: 'gaurav685',
        role: 'admin'
      })

      // Clean up
      localStorage.removeItem('resetCode')
      localStorage.removeItem('resetCodeTimestamp')
      localStorage.removeItem('resetEmail')

      // Redirect to dashboard
      navigate('/dashboard')
    } else {
      setError('Invalid verification code. Please try again.')
    }

    setIsLoading(false)
  }

  const handleResendCode = () => {
    localStorage.removeItem('resetCode')
    localStorage.removeItem('resetCodeTimestamp')
    localStorage.removeItem('resetEmail')
    navigate('/forgot-password')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Enter Verification Code</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="000000"
            />
            {timeLeft > 0 && (
              <p className="mt-2 text-xs text-gray-500 text-center">
                Code expires in: <span className="text-blue-400 font-medium">{formatTime(timeLeft)}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Code & Login'
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              className="w-full py-3 px-4 border border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Resend Code
            </button>
          </div>
        </form>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium">Login Credentials:</p>
              <p className="mt-1 text-gray-400">
                Username: <span className="text-blue-400">gaurav685</span>, <span className="text-blue-400">boss</span>, or <span className="text-blue-400">badakh</span>
              </p>
              <p className="text-gray-400">
                Password: <span className="text-blue-400">awsedrftg2468</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
