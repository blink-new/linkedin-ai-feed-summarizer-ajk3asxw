import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Mail, FileText, Clock, Save, CheckCircle } from 'lucide-react'
import { User, Settings as SettingsType } from '@/types'

interface SettingsProps {
  user: User
  onClose: () => void
}

export function Settings({ user, onClose }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsType>({
    id: `settings_${user.id}`,
    userId: user.id,
    emailEnabled: true,
    notionEnabled: false,
    dailyTime: '09:00',
    emailAddress: user.email,
    notionPageId: '',
    summaryLength: 'medium'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem(`settings_${user.id}`)
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [user.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof SettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-1">Configure your LinkedIn feed summarization preferences</p>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive your daily LinkedIn feed summaries via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-enabled">Enable Email Summaries</Label>
                  <p className="text-sm text-gray-500">Receive daily summaries in your inbox</p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => updateSetting('emailEnabled', checked)}
                />
              </div>
              
              {settings.emailEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    value={settings.emailAddress || ''}
                    onChange={(e) => updateSetting('emailAddress', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notion Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Notion Integration
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Save your summaries directly to your Notion workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notion-enabled">Enable Notion Integration</Label>
                  <p className="text-sm text-gray-500">Automatically save summaries to Notion</p>
                </div>
                <Switch
                  id="notion-enabled"
                  checked={settings.notionEnabled}
                  onCheckedChange={(checked) => updateSetting('notionEnabled', checked)}
                  disabled
                />
              </div>
              
              {settings.notionEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="notion-page">Notion Page ID</Label>
                  <Input
                    id="notion-page"
                    value={settings.notionPageId || ''}
                    onChange={(e) => updateSetting('notionPageId', e.target.value)}
                    placeholder="Enter your Notion page ID"
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Find your page ID in the Notion page URL
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Schedule & Preferences
              </CardTitle>
              <CardDescription>
                Customize when and how your summaries are generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-time">Daily Summary Time</Label>
                  <Select
                    value={settings.dailyTime}
                    onValueChange={(value) => updateSetting('dailyTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary-length">Summary Length</Label>
                  <Select
                    value={settings.summaryLength}
                    onValueChange={(value: 'short' | 'medium' | 'long') => updateSetting('summaryLength', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                      <SelectItem value="medium">Medium (2-3 paragraphs)</SelectItem>
                      <SelectItem value="long">Long (3-4 paragraphs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your current account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User ID:</span>
                <span className="text-sm text-gray-600 font-mono">{user.id.substring(0, 12)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">LinkedIn Status:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0A66C2] hover:bg-[#004182]"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}