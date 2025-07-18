import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Settings } from '@/components/dashboard/Settings'
import { blink } from '@/blink/client'
import { User } from '@/types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#0A66C2] rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">LI</span>
          </div>
          <div className="w-8 h-8 border-4 border-[#0A66C2] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading LinkedIn Feed Summarizer...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-[#0A66C2] rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">LI</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Feed Summarizer</h1>
            <p className="text-gray-600">
              Get AI-powered daily summaries of your LinkedIn feed delivered to your email or saved to Notion
            </p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <Header 
        user={user} 
        onSettingsClick={() => setShowSettings(true)} 
      />
      <main>
        <Dashboard user={user} />
      </main>
      
      {showSettings && (
        <Settings 
          user={user} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  )
}

export default App