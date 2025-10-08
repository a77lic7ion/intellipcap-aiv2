import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Settings as SettingsIcon, Key, Palette, Network, Shield } from 'lucide-react'

export function Settings({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [autoCapture, setAutoCapture] = useState(false)
  const [maxPackets, setMaxPackets] = useState('10000')
  const [captureFilter, setCaptureFilter] = useState('')
  const [theme, setTheme] = useState('dark')

  const THEME_STORAGE_KEY = 'theme'
  const mediaQueryRef = useRef(null)

  function mediaChangeHandler(e) {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || 'auto'
    if (stored === 'auto') {
      document.documentElement.classList.toggle('dark', e.matches)
      setDarkMode(e.matches)
    }
  }

  function applyTheme(nextTheme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = nextTheme === 'dark' || (nextTheme === 'auto' && prefersDark)
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    setDarkMode(isDark)

    // manage listener for auto mode
    if (mediaQueryRef.current) {
      mediaQueryRef.current.removeEventListener('change', mediaChangeHandler)
      mediaQueryRef.current = null
    }
    if (nextTheme === 'auto' && window.matchMedia) {
      mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQueryRef.current.addEventListener('change', mediaChangeHandler)
    }
  }

  function handleThemeChange(value) {
    setTheme(value)
    applyTheme(value)
  }

  function handleDarkModeToggle(checked) {
    // toggling switch sets explicit dark/light
    const next = checked ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
  }

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || 'auto'
    setTheme(stored)
    applyTheme(stored)
    return () => {
      if (mediaQueryRef.current) {
        mediaQueryRef.current.removeEventListener('change', mediaChangeHandler)
        mediaQueryRef.current = null
      }
    }
  }, [])

  if (!isOpen) return null

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', {
      apiKey,
      darkMode,
      autoCapture,
      maxPackets,
      captureFilter,
      theme
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Settings
          </CardTitle>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="capture">Capture</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Appearance
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={handleDarkModeToggle}
                    />
                    <Label htmlFor="dark-mode">Enable Dark Mode</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="max-packets">Maximum Packets to Display</Label>
                  <Input
                    id="max-packets"
                    value={maxPackets}
                    onChange={(e) => setMaxPackets(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                    placeholder="10000"
                  />
                  <p className="text-xs text-gray-400">
                    Higher values may impact performance
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="capture" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Network className="w-5 h-5 mr-2" />
                  Capture Settings
                </h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-capture"
                    checked={autoCapture}
                    onCheckedChange={setAutoCapture}
                  />
                  <Label htmlFor="auto-capture">Auto-start capture on interface selection</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-filter">Default BPF Filter</Label>
                  <Input
                    id="default-filter"
                    value={captureFilter}
                    onChange={(e) => setCaptureFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                    placeholder="tcp port 80 or udp port 53"
                  />
                  <p className="text-xs text-gray-400">
                    This filter will be applied by default to new captures
                  </p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Common BPF Filters</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-gray-600 px-2 py-1 rounded">tcp port 80</code>
                      <span className="text-xs text-gray-400">HTTP traffic</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-gray-600 px-2 py-1 rounded">udp port 53</code>
                      <span className="text-xs text-gray-400">DNS queries</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-gray-600 px-2 py-1 rounded">icmp</code>
                      <span className="text-xs text-gray-400">ICMP packets</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  AI Configuration
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">Google Gemini API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                    placeholder="Enter your Gemini API key"
                  />
                  <p className="text-xs text-gray-400">
                    Get your API key from <a href="https://ai.google.dev/" className="text-blue-400 hover:underline">Google AI Studio</a>
                  </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy Notice
                  </h4>
                  <p className="text-sm text-gray-300">
                    Your API key is stored locally and only used for direct communication with Google's AI services. 
                    Packet data is processed locally and never sent to external services without your explicit consent.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">AI Analysis Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Security</Badge>
                      <p className="text-xs text-gray-300">
                        Detect potential threats, malicious patterns, and security vulnerabilities
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Performance</Badge>
                      <p className="text-xs text-gray-300">
                        Analyze network performance, bottlenecks, and optimization opportunities
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Anomaly</Badge>
                      <p className="text-xs text-gray-300">
                        Identify unusual traffic patterns and potential network issues
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security & Privacy
                </h3>
                
                <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Local Processing</h4>
                  <p className="text-sm text-gray-300">
                    All packet analysis is performed locally on your machine. No packet data is transmitted to external servers.
                  </p>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Administrator Privileges</h4>
                  <p className="text-sm text-gray-300">
                    Live packet capture requires administrator/sudo privileges. This is necessary to access network interfaces directly.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Data Retention</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Captured packets</span>
                      <Badge variant="outline">Session only</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Analysis results</span>
                      <Badge variant="outline">Session only</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API keys</span>
                      <Badge variant="outline">Local storage</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
