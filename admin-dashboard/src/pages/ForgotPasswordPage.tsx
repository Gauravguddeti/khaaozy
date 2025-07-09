import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Only allow specific email
    if (email !== 'guddetigaurav1@gmail.com') {
      setError('This email is not authorized for admin access')
      setIsLoading(false)
      return
    }

    try {
      // Generate random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store the code and timestamp in localStorage (in production, use secure backend)
      localStorage.setItem('resetCode', verificationCode)
      localStorage.setItem('resetCodeTimestamp', Date.now().toString())
      localStorage.setItem('resetEmail', email)

      // In a real app, you would send this via email service like SendGrid, Resend, etc.
      // For demo purposes, we'll show the code in console and alert
      console.log('Verification Code:', verificationCode)
      alert(`Your verification code is: ${verificationCode}\n\nCredentials:\nUsername: gaurav685 or boss or badakh\nPassword: awsedrftg2468`)

      setIsEmailSent(true)
      
      // Auto-redirect to verification page after 3 seconds
      setTimeout(() => {
        navigate('/verify-reset-code')
      }, 3000)

    } catch (err) {
      setError('Failed to send verification email. Please try again.')
    }
    
    setIsLoading(false)
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <EnvelopeIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">Check Your Email</h2>
            <p className="mt-2 text-sm text-gray-400">
              We've sent a verification code to <strong className="text-white">{email}</strong>
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-center space-y-4">
              <div className="text-gray-300">
                <p className="text-sm">The verification code has been sent to your email.</p>
                <p className="text-sm mt-2">Please check your inbox and enter the code on the next page.</p>
              </div>
              
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
              
              <p className="text-xs text-gray-500">Redirecting to verification page...</p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/verify-reset-code" 
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Continue to verification →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your admin email to receive verification code and credentials
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Admin Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your authorized email"
            />
            <p className="mt-2 text-xs text-gray-500">
              Only authorized admin emails can request password reset
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Code...
              </div>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>

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
