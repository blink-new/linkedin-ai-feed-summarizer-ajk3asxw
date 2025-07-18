import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Linkedin, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface LinkedInConnectProps {
  isConnected: boolean
  onConnect: () => void
}

export function LinkedInConnect({ isConnected, onConnect }: LinkedInConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await onConnect()
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="border-2 border-dashed border-gray-200 hover:border-[#0A66C2] transition-colors">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-[#0A66C2] rounded-full flex items-center justify-center mb-4">
          <Linkedin className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl">Connect Your LinkedIn Account</CardTitle>
        <CardDescription className="text-gray-600">
          Connect your LinkedIn account to start receiving AI-powered feed summaries
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
            <p className="text-sm text-gray-600">
              Your LinkedIn account is connected and ready for summarization
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Connected
            </Badge>
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-[#0A66C2] hover:bg-[#004182] text-white px-8"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 mr-2" />
                  Connect LinkedIn
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500">
              We'll redirect you to LinkedIn to authorize access to your feed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}