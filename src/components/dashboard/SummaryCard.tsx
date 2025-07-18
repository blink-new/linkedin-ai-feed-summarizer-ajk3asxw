import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, Mail, FileText, Eye } from 'lucide-react'
import { FeedSummary } from '@/types'

interface SummaryCardProps {
  summary: FeedSummary
  onViewDetails: (summary: FeedSummary) => void
}

export function SummaryCard({ summary, onViewDetails }: SummaryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#0A66C2]" />
              {formatDate(summary.date)}
            </CardTitle>
            <CardDescription className="flex items-center text-sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              {summary.postCount} posts analyzed
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            {summary.sentToEmail && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </Badge>
            )}
            {summary.savedToNotion && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Notion
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">Key Topics</h4>
          <div className="flex flex-wrap gap-1">
            {summary.keyTopics.slice(0, 3).map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
            {summary.keyTopics.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{summary.keyTopics.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">Summary Preview</h4>
          <p className="text-sm text-gray-600 line-clamp-3">
            {summary.summary.substring(0, 150)}...
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(summary)}
          className="w-full"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Full Summary
        </Button>
      </CardContent>
    </Card>
  )
}