import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LinkedInConnect } from './LinkedInConnect'
import { SummaryCard } from './SummaryCard'
import { SummaryModal } from './SummaryModal'
import { Sparkles, Clock, Zap, Plus } from 'lucide-react'
import { FeedSummary, User } from '@/types'
import { blink } from '@/blink/client'

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false)
  const [summaries, setSummaries] = useState<FeedSummary[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSummary, setSelectedSummary] = useState<FeedSummary | null>(null)

  const loadSummaries = useCallback(async () => {
    try {
      // Load from localStorage (since database creation failed)
      const existingSummaries = JSON.parse(localStorage.getItem(`summaries_${user.id}`) || '[]')
      setSummaries(existingSummaries.slice(0, 10)) // Limit to 10 most recent
    } catch (error) {
      console.error('Failed to load summaries:', error)
    }
  }, [user.id])

  useEffect(() => {
    loadSummaries()
  }, [loadSummaries])

  const handleLinkedInConnect = async () => {
    // Simulate LinkedIn OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLinkedInConnected(true)
  }

  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    try {
      // Simulate LinkedIn feed data (in real implementation, this would come from LinkedIn API)
      const mockLinkedInPosts = [
        {
          id: '1',
          content: 'Excited to share that our AI startup just raised $10M Series A! The future of artificial intelligence in business automation is incredibly promising. Looking forward to scaling our team and expanding our product offerings.',
          author: 'Sarah Chen, CEO at TechFlow AI',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          engagement: { likes: 234, comments: 45, shares: 12 }
        },
        {
          id: '2',
          content: 'Remote work has fundamentally changed how we approach team collaboration. After 3 years of distributed teams, here are the key lessons: 1) Async communication is crucial 2) Regular video check-ins build trust 3) Clear documentation prevents confusion. What has your experience been?',
          author: 'Michael Rodriguez, VP Engineering',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          engagement: { likes: 156, comments: 78, shares: 23 }
        },
        {
          id: '3',
          content: 'Just completed my AWS Solutions Architect certification! The journey was challenging but incredibly rewarding. For anyone considering cloud certifications, my advice: hands-on practice is more valuable than just reading. Build real projects, break things, and learn from failures.',
          author: 'Jennifer Park, Cloud Engineer',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          engagement: { likes: 89, comments: 34, shares: 8 }
        },
        {
          id: '4',
          content: 'The latest developments in generative AI are reshaping content creation across industries. From marketing copy to code generation, we\'re seeing unprecedented productivity gains. However, the human element remains irreplaceable for strategy, creativity, and ethical oversight.',
          author: 'David Kim, AI Research Director',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          engagement: { likes: 312, comments: 67, shares: 45 }
        },
        {
          id: '5',
          content: 'Mentorship has been the cornerstone of my career growth. Today I\'m launching a new initiative to connect senior developers with junior talent. If you\'re interested in either mentoring or being mentored, let\'s connect! Building the next generation of tech leaders is everyone\'s responsibility.',
          author: 'Amanda Foster, Senior Software Architect',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          engagement: { likes: 198, comments: 56, shares: 19 }
        }
      ]

      // Call the summarize-feed edge function
      const summaryResponse = await fetch('https://ajk3asxw--summarize-feed.functions.blink.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await blink.auth.getToken()}`
        },
        body: JSON.stringify({
          userId: user.id,
          linkedInPosts: mockLinkedInPosts
        })
      })

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary')
      }

      const summaryData = await summaryResponse.json()

      // Create the summary record
      const newSummary: FeedSummary = {
        id: `summary_${Date.now()}`,
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        summary: summaryData.summary,
        postCount: summaryData.postCount,
        keyTopics: summaryData.keyTopics,
        createdAt: new Date().toISOString(),
        sentToEmail: false,
        savedToNotion: false
      }

      // Save to local storage (since database creation failed)
      const existingSummaries = JSON.parse(localStorage.getItem(`summaries_${user.id}`) || '[]')
      const updatedSummaries = [newSummary, ...existingSummaries]
      localStorage.setItem(`summaries_${user.id}`, JSON.stringify(updatedSummaries))
      setSummaries(updatedSummaries)

      // Send email notification
      try {
        const emailResponse = await fetch('https://ajk3asxw--send-summary-email.functions.blink.new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await blink.auth.getToken()}`
          },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            summary: summaryData.summary,
            keyTopics: summaryData.keyTopics,
            date: newSummary.date,
            postCount: summaryData.postCount
          })
        })

        if (emailResponse.ok) {
          newSummary.sentToEmail = true
          // Update the summary in storage
          const updatedSummariesWithEmail = updatedSummaries.map(s => 
            s.id === newSummary.id ? { ...s, sentToEmail: true } : s
          )
          localStorage.setItem(`summaries_${user.id}`, JSON.stringify(updatedSummariesWithEmail))
          setSummaries(updatedSummariesWithEmail)
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
      }

    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleViewSummaryDetails = (summary: FeedSummary) => {
    setSelectedSummary(summary)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.displayName || user.email.split('@')[0]}!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay on top of your LinkedIn network with AI-powered daily summaries
        </p>
      </div>

      {/* LinkedIn Connection Status */}
      {!isLinkedInConnected && (
        <LinkedInConnect 
          isConnected={isLinkedInConnected}
          onConnect={handleLinkedInConnect}
        />
      )}

      {/* Quick Actions */}
      {isLinkedInConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-[#0A66C2] bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-[#0A66C2]" />
                Generate Summary
              </CardTitle>
              <CardDescription>
                Create an AI summary of your latest LinkedIn feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="w-full bg-[#0A66C2] hover:bg-[#004182]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Next Summary
              </CardTitle>
              <CardDescription>
                Scheduled for tomorrow at 9:00 AM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                Auto-enabled
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">This Week</CardTitle>
              <CardDescription>
                Summary statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Summaries generated:</span>
                <span className="font-medium">{summaries.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Posts analyzed:</span>
                <span className="font-medium">
                  {summaries.reduce((acc, s) => acc + s.postCount, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Summaries */}
      {summaries.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-900">Recent Summaries</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((summary) => (
              <SummaryCard
                key={summary.id}
                summary={summary}
                onViewDetails={handleViewSummaryDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isLinkedInConnected && summaries.length === 0 && (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">No summaries yet</h3>
              <p className="text-gray-600">
                Generate your first AI-powered LinkedIn feed summary to get started
              </p>
            </div>
            <Button 
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="bg-[#0A66C2] hover:bg-[#004182]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate First Summary
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Modal */}
      {selectedSummary && (
        <SummaryModal
          summary={selectedSummary}
          onClose={() => setSelectedSummary(null)}
        />
      )}
    </div>
  )
}