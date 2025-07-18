export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
  headline?: string
}

export interface FeedSummary {
  id: string
  userId: string
  date: string
  summary: string
  postCount: number
  keyTopics: string[]
  createdAt: string
  sentToEmail: boolean
  savedToNotion: boolean
}

export interface Settings {
  id: string
  userId: string
  emailEnabled: boolean
  notionEnabled: boolean
  dailyTime: string
  emailAddress?: string
  notionPageId?: string
  summaryLength: 'short' | 'medium' | 'long'
}