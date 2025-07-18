import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings, LogOut } from 'lucide-react'
import { blink } from '@/blink/client'
import { User } from '@/types'

interface HeaderProps {
  user: User | null
  onSettingsClick: () => void
}

export function Header({ user, onSettingsClick }: HeaderProps) {
  const handleLogout = () => {
    blink.auth.logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LI</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">LinkedIn Feed Summarizer</h1>
            <p className="text-sm text-gray-500">AI-powered daily insights</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-[#0A66C2] text-white text-sm">
                  {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.displayName || user.email}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}