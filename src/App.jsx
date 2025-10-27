import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import {
  FileUp,
  Play,
  Square,
  Search,
  Download,
  Brain,
  Shield,
  Activity,
  Network,
  Filter,
  Settings as SettingsIcon,
  BarChart3,
  FileText,
  Zap,
  Eye,
  TrendingUp,
  RotateCcw
} from 'lucide-react'
import { PacketDetails } from './components/PacketDetails.jsx'
import { TrafficVisualization } from './components/TrafficVisualization.jsx'
import { Settings } from './components/Settings.jsx'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion.jsx'
import './App.css'

// Common ports list for quick selection
const COMMON_PORTS = [
  { value: 'all', label: 'All ports' },
  { value: '20', label: '20 (FTP data)' },
  { value: '21', label: '21 (FTP control)' },
  { value: '22', label: '22 (SSH)' },
  { value: '23', label: '23 (Telnet)' },
  { value: '25', label: '25 (SMTP)' },
  { value: '53', label: '53 (DNS)' },
  { value: '67', label: '67 (DHCP server)' },
  { value: '68', label: '68 (DHCP client)' },
  { value: '80', label: '80 (HTTP)' },
  { value: '110', label: '110 (POP3)' },
  { value: '123', label: '123 (NTP)' },
  { value: '143', label: '143 (IMAP)' },
  { value: '161', label: '161 (SNMP)' },
  { value: '443', label: '443 (HTTPS)' },
  { value: '465', label: '465 (SMTPS)' },
  { value: '587', label: '587 (Mail submission)' },
  { value: '993', label: '993 (IMAPS)' },
  { value: '995', label: '995 (POP3S)' },
  { value: '3306', label: '3306 (MySQL)' },
  { value: '5432', label: '5432 (PostgreSQL)' },
  { value: '6379', label: '6379 (Redis)' },
  { value: '8080', label: '8080 (HTTP-alt)' },
]

const buildPortBpf = (protocol, port) => {
  if (port === 'all') {
    if (protocol === 'tcp') return 'tcp'
    if (protocol === 'udp') return 'udp'
    // any + all ports: capture all traffic (Wireshark default)
    return ''
  }
  if (protocol === 'tcp') return `tcp port ${port}`
  if (protocol === 'udp') return `udp port ${port}`
  // any protocol: include both TCP/UDP on that port
  return `(tcp port ${port} or udp port ${port})`
}

function App() {
  const [activeTab, setActiveTab] = useState('capture')
  const [isCapturing, setIsCapturing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [packets, setPackets] = useState([])
  const [filteredPackets, setFilteredPackets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInterface, setSelectedInterface] = useState('')
  const [bpfFilter, setBpfFilter] = useState('')
  const [portProtocol, setPortProtocol] = useState('any') // any | tcp | udp
  const [portSelection, setPortSelection] = useState('all') // common port number or 'all'
  const [captureDuration, setCaptureDuration] = useState('30s')
  const [analysisReport, setAnalysisReport] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisAccordionOpen, setAnalysisAccordionOpen] = useState([])
  const [captureProgress, setCaptureProgress] = useState(0)
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef(null)
  const captureIntervalRef = useRef(null)
  const captureStartRef = useRef(null)

  const severityBadgeClass = (sev) => {
    if (!sev) return ''
    const s = String(sev).toLowerCase()
    if (s.includes('critical') || s.includes('high')) return 'bg-red-600 text-white border-red-600'
    if (s.includes('medium')) return 'bg-yellow-500 text-black border-yellow-500'
    if (s.includes('low')) return 'bg-green-600 text-white border-green-600'
    return 'bg-gray-600 text-white border-gray-600'
  }

  const handlePortProtocolChange = (value) => {
    setPortProtocol(value)
    const next = buildPortBpf(value, portSelection)
    setBpfFilter(next)
  }

  const handlePortSelectionChange = (value) => {
    setPortSelection(value)
    const next = buildPortBpf(portProtocol, value)
    setBpfFilter(next)
  }

  const networkInterfaces = [
    'eth0 - Ethernet',
    'wlan0 - Wireless',
    'lo - Loopback',
    'docker0 - Docker Bridge'
  ]

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file && (file.name.endsWith('.pcap') || file.name.endsWith('.pcapng'))) {
      setSelectedFile(file)
      const formData = new FormData()
      formData.append('pcap', file)
      await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      })
      fetchPackets()
    }
  }

  const fetchPackets = async () => {
    const response = await fetch('http://localhost:3001/packets')
    const data = await response.json()
    const formattedPackets = data.map((p, i) => ({
      id: i + 1,
      timestamp: new Date(p.pcap_header.tv_sec * 1000 + p.pcap_header.tv_usec / 1000).toISOString(),
      source: p.payload.payload.saddr.addr.join('.'),
      destination: p.payload.payload.daddr.addr.join('.'),
      protocol: p.payload.payload.protocolName,
      length: p.pcap_header.len,
      info: '', // This would require deeper packet inspection
      port: p.payload.payload.payload?.sport || p.payload.payload.payload?.dport || null,
    }));
    setPackets(formattedPackets)
    setFilteredPackets(formattedPackets)
  }

  const handleStartCapture = () => {
    if (!selectedInterface) return

    setIsCapturing(true)
    setCaptureProgress(0)
    setPackets([])
    setFilteredPackets([])

    const durationMap = {
      '10s': 10,
      '30s': 30,
      '1m': 60,
      '5m': 300,
      '10m': 600,
      'unlimited': null,
    }
    const durationSeconds = durationMap[captureDuration]
    captureStartRef.current = Date.now()

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    captureIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - captureStartRef.current) / 1000
      if (durationSeconds != null) {
        const pct = Math.min(100, Math.round((elapsed / durationSeconds) * 100))
        setCaptureProgress(pct)
      }

      fetchPackets()

      if (durationSeconds != null && elapsed >= durationSeconds) {
        clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
        setIsCapturing(false)
      }
    }, 1000)
  }

  const handleStopCapture = () => {
    setIsCapturing(false)
    setCaptureProgress(0)
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }
    setFilteredPackets(packets)
  }

  const exportData = (format) => {

    if (format !== 'pdf' && (!filteredPackets || filteredPackets.length === 0)) return

    const rows = filteredPackets.map(p => ({
      id: p.id,
      timestamp: p.timestamp,
      source: p.source,
      destination: p.destination,
      protocol: p.protocol,
      length: p.length,
      info: p.info,
      port: p.port ?? ''
    }))

    const download = (blob, filename) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    if (format === 'csv') {
      const headers = Object.keys(rows[0])
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => {
        const v = r[h]
        const s = v == null ? '' : String(v)
        const needsQuote = s.includes(',') || s.includes('"') || s.includes('\n')
        const escaped = s.replace(/"/g, '""')
        return needsQuote ? `"${escaped}"` : escaped
      }).join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      download(blob, 'packets.csv')

      if (analysisReport) {
        const aiRows = []
        Object.entries(analysisReport.overview || {}).forEach(([k, v]) => {
          aiRows.push({ section: 'Overview', key: k, value: String(v) })
        })
        ;(analysisReport.protocolDistribution || []).forEach(p => {
          aiRows.push({ section: 'ProtocolDistribution', key: p.name, value: `${p.count} (${p.pct}%)` })
        })
        ;(analysisReport.risks || []).forEach(r => {
          aiRows.push({ section: 'Risks', key: r.category, value: r.severity })
        })
        ;(analysisReport.findings || []).forEach(f => {
          aiRows.push({ section: 'Findings', key: f.category, value: f.detail })
        })
        Object.entries(analysisReport.performance || {}).forEach(([k, v]) => {
          aiRows.push({ section: 'Performance', key: k, value: String(v) })
        })
        ;(analysisReport.anomalies?.observations || []).forEach(obs => {
          aiRows.push({ section: 'Anomalies', key: 'observation', value: obs })
        })
        ;(analysisReport.recommendations || []).forEach(rec => {
          aiRows.push({ section: 'Recommendations', key: 'recommendation', value: rec })
        })

        const aiHeaders = ['section','key','value']
        const aiCsv = [aiHeaders.join(','), ...aiRows.map(r => aiHeaders.map(h => {
          const s = String(r[h] ?? '')
          const needsQuote = s.includes(',') || s.includes('"') || s.includes('\n')
          const escaped = s.replace(/"/g, '""')
          return needsQuote ? `"${escaped}"` : escaped
        }).join(','))].join('\n')
        const aiBlob = new Blob([aiCsv], { type: 'text/csv;charset=utf-8;' })
        download(aiBlob, 'ai-report.csv')
      }
    } else if (format === 'pdf') {
      const headers = rows.length ? Object.keys(rows[0]) : ['id','timestamp','source','destination','protocol','length','info','port']
      const ai = analysisReport
      const style = `body{font-family:Arial, sans-serif; padding:20px; color:#0b0b0b;} h1{font-size:20px; margin-bottom:8px;} h2{font-size:16px; margin-top:18px;} table{border-collapse:collapse; width:100%; margin-top:8px;} th,td{border:1px solid #333; padding:6px; font-size:12px;} ul{margin:6px 0 0 18px; font-size:12px}`
      const aiSection = ai ? `
        <h1>AI-Powered Analysis</h1>
        <h2>Overview</h2>
        <table><tbody>
          ${Object.entries(ai.overview || {}).map(([k,v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
        </tbody></table>
        <h2>Protocol Distribution</h2>
        <table><thead><tr><th>Protocol</th><th>Count</th><th>Percent</th></tr></thead><tbody>
          ${(ai.protocolDistribution || []).map(p => `<tr><td>${p.name}</td><td>${p.count}</td><td>${p.pct}%</td></tr>`).join('')}
        </tbody></table>
        <h2>Risks</h2>
        ${ai.risks && ai.risks.length ? `<table><thead><tr><th>Category</th><th>Severity</th><th>Detail</th></tr></thead><tbody>${ai.risks.map(r => `<tr><td>${r.category}</td><td>${r.severity || ''}</td><td>${r.description || ''}</td></tr>`).join('')}</tbody></table>` : '<p>No significant risks detected.</p>'}
        <h2>Findings</h2>
        ${ai.findings && ai.findings.length ? `<table><thead><tr><th>Category</th><th>Detail</th></tr></thead><tbody>${ai.findings.map(f => `<tr><td>${f.category}</td><td>${f.detail}</td></tr>`).join('')}</tbody></table>` : '<p>No notable findings.</p>'}
        <h2>Performance</h2>
        <table><tbody>
          ${Object.entries(ai.performance || {}).map(([k,v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
        </tbody></table>
        <h2>Anomalies</h2>
        ${(ai.anomalies?.observations || []).length ? `<ul>${ai.anomalies.observations.map(a => `<li>${a}</li>`).join('')}</ul>` : '<p>No anomalies observed.</p>'}
        <h2>Recommendations</h2>
        ${(ai.recommendations || []).length ? `<ul>${ai.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>` : '<p>No recommendations.</p>'}
      ` : '<p>No AI analysis available.</p>'

      const packetTable = rows.length ? `
        <h1>Packet Report</h1>
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${headers.map(h => `<td>${r[h]}</td>`).join('')}</tr>`).join('')}</tbody></table>
      ` : '<p>No packets available.</p>'

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IntelliPCAP.AI Report</title><style>${style}</style></head><body>${aiSection}${packetTable}</body></html>`
      const w = window.open('', '_blank')
      if (w) {
        w.document.open()
        w.document.write(html)
        w.document.close()
        w.focus()
        w.print()
      }
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (!term) {
      setFilteredPackets(packets)
    } else {
      const filtered = packets.filter(packet =>
        packet.source.includes(term) ||
        packet.destination.includes(term) ||
        packet.protocol.toLowerCase().includes(term.toLowerCase()) ||
        packet.info.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredPackets(filtered)
    }
  }

  const handleAIAnalysis = () => {
    if (!packets.length) return
    setIsAnalyzing(true)
    setAnalysisAccordionOpen([])

    const byProtocol = packets.reduce((acc, p) => {
      acc[p.protocol] = (acc[p.protocol] || 0) + 1
      return acc
    }, {})
    const uniqueSources = new Set(packets.map(p => p.source))
    const uniqueDestinations = new Set(packets.map(p => p.destination))
    const avgLen = Math.round(
      packets.reduce((sum, p) => sum + (p.length || 0), 0) / packets.length
    )

    const risks = []
    const findings = []

    const sshPackets = packets.filter(p => p.protocol === 'SSH')
    if (sshPackets.length) {
      risks.push({
        title: 'SSH activity detected',
        severity: 'Medium',
        detail: 'Monitor for brute-force attempts and enforce key-based auth.',
      })
    }

    const dnsPackets = packets.filter(p => p.protocol === 'UDP' && (p.port === 53 || /DNS/i.test(p.info)))
    if (dnsPackets.length) {
      findings.push({
        title: 'DNS queries observed',
        detail: 'External DNS usage appears normal. Verify domain reputation as needed.',
      })
    }

    const icmpPackets = packets.filter(p => p.protocol === 'ICMP')
    if (icmpPackets.length) {
      findings.push({
        title: 'ICMP echo requests',
        detail: 'Likely diagnostic traffic. Ensure ICMP is rate-limited for WAN exposure.',
      })
    }

    const tlsPackets = packets.filter(p => p.protocol === 'TLS')
    if (tlsPackets.length) {
      findings.push({
        title: 'TLS application data',
        detail: 'Encrypted traffic appears normal. Consider monitoring handshake performance.',
      })
    }

    const overallRisk = sshPackets.length > 0 ? 'Medium' : 'Low'

    const protocolDistribution = Object.entries(byProtocol)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / packets.length) * 100) }))
      .sort((a, b) => b.count - a.count)

    const recommendations = [
      'Enforce SSH key-based authentication and monitor login attempts',
      'Track DNS query patterns for anomalies; consider DNS filtering',
      'Rate-limit ICMP and restrict where appropriate',
      'Monitor TLS handshake metrics and certificate validity',
      'Implement segmentation for sensitive subnets and services',
    ]

    const report = {
      overview: {
        totalPackets: packets.length,
        uniqueSources: uniqueSources.size,
        uniqueDestinations: uniqueDestinations.size,
        averagePacketSize: avgLen,
        overallRisk,
        timeRange: `${packets[0]?.timestamp} – ${packets[packets.length - 1]?.timestamp}`,
      },
      protocolDistribution,
      risks,
      findings,
      performance: {
        peakTime: packets[packets.length - 1]?.timestamp,
        bandwidthUtilization: 'Normal (simulated)',
        latencyObservations: 'No significant issues detected (simulated)',
      },
      anomalies: {
        observations: icmpPackets.length ? ['ICMP present; verify intended diagnostic use'] : ['No anomalous patterns detected'],
      },
      recommendations,
    }

    setTimeout(() => {
      setAnalysisReport(report)
      setIsAnalyzing(false)
      setAnalysisAccordionOpen(['overview','protocols','risks','findings','performance','anomalies','recommendations'])
    }, 800)
  }

  const handleStartOver = async () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }
    setIsCapturing(false)
    captureStartRef.current = null
    setCaptureProgress(0)

    setActiveTab('capture')
    setSelectedFile(null)
    setPackets([])
    setFilteredPackets([])
    setSearchTerm('')
    setSelectedInterface('')
    setBpfFilter('')
    setPortProtocol('any')
    setPortSelection('all')
    setCaptureDuration('30s')
    setSelectedPacket(null)

    setIsAnalyzing(false)
    setAnalysisReport(null)
    setAnalysisAccordionOpen([])

    setShowSettings(false)

    if (fileInputRef.current) {
      try { fileInputRef.current.value = '' } catch (e) {}
    }

    await fetch('http://localhost:3001/clear', { method: 'POST' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">IntelliPCAP.AI v2</h1>
                <p className="text-sm text-gray-400">Advanced Network Packet Analysis with AI Integration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Zap className="w-3 h-3 mr-1" />
              AI Enabled
            </Badge>
            <Button variant="outline" size="sm" onClick={handleStartOver}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="capture" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Capture
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="visualization" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-blue-600">
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Packet Capture Tab */}
          <TabsContent value="capture" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileUp className="w-5 h-5 mr-2" />
                    Load PCAP File
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400 mb-4">
                      Drop your .pcap or .pcapng file here, or click to browse
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pcap,.pcapng"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {selectedFile && (
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Selected:</strong> {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Live Capture */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Live Capture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="interface">Network Interface</Label>
                      <Select value={selectedInterface} onValueChange={setSelectedInterface}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select interface" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {networkInterfaces.map((iface, index) => (
                            <SelectItem key={index} value={iface}>
                              {iface}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Capture Duration</Label>
                      <Select value={captureDuration} onValueChange={setCaptureDuration}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="10s">10 seconds</SelectItem>
                          <SelectItem value="30s">30 seconds</SelectItem>
                          <SelectItem value="1m">1 minute</SelectItem>
                          <SelectItem value="5m">5 minutes</SelectItem>
                          <SelectItem value="10m">10 minutes</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="port-protocol">Port Protocol</Label>
                        <Select value={portProtocol} onValueChange={handlePortProtocolChange}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Any/TCP/UDP" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="tcp">TCP</SelectItem>
                            <SelectItem value="udp">UDP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="common-port">Common Port</Label>
                        <Select value={portSelection} onValueChange={handlePortSelectionChange}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Select common port" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {COMMON_PORTS.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bpf-filter">BPF Filter (Optional)</Label>
                      <Input
                        id="bpf-filter"
                        placeholder="e.g., tcp port 80"
                        value={bpfFilter}
                        onChange={(e) => setBpfFilter(e.target.value)}
                        className="bg-gray-700 border-gray-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">Use the dropdowns above to quickly set port filters. Choose "All ports" to include everything Wireshark scans.</p>
                    </div>

                    {isCapturing && (
                      <div className="space-y-2">
                        <Label>Capture Progress</Label>
                        {captureDuration === 'unlimited' ? (
                          <div className="flex items-center text-xs text-gray-400">
                            <div className="animate-pulse h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                            Capturing packets... (unlimited)
                          </div>
                        ) : (
                          <>
                            <Progress value={captureProgress} className="bg-gray-700" />
                            <p className="text-xs text-gray-400">
                              Capturing packets... {captureProgress}%
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleStartCapture}
                        disabled={!selectedInterface || isCapturing}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Capture
                      </Button>
                      <Button
                        onClick={handleStopCapture}
                        disabled={!isCapturing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Packet Table */}
            {(packets.length > 0 || selectedFile) && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Captured Packets ({filteredPackets.length})</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search packets..."
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10 bg-gray-700 border-gray-600 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Timestamp</th>
                          <th className="text-left p-2">Source</th>
                          <th className="text-left p-2">Destination</th>
                          <th className="text-left p-2">Protocol</th>
                          <th className="text-left p-2">Length</th>
                          <th className="text-left p-2">Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPackets.map((packet) => (
                          <tr
                            key={packet.id}
                            className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => setSelectedPacket(packet)}
                          >
                            <td className="p-2 text-gray-400">{packet.id}</td>
                            <td className="p-2 font-mono text-xs">{packet.timestamp}</td>
                            <td className="p-2 font-mono">{packet.source}</td>
                            <td className="p-2 font-mono">{packet.destination}</td>
                            <td className="p-2">
                              <Badge variant="secondary" className="text-xs">
                                {packet.protocol}
                              </Badge>
                            </td>
                            <td className="p-2">{packet.length}</td>
                            <td className="p-2 text-gray-300">{packet.info}</td>
                            <td className="p-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-6">
            <TrafficVisualization />
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Packets</p>
                      <p className="text-2xl font-bold">{packets.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Protocols</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <Network className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Unique IPs</p>
                      <p className="text-2xl font-bold">6</p>
                    </div>
                    <Shield className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Data Size</p>
                      <p className="text-2xl font-bold">1.7KB</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Protocol Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>TCP</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm text-gray-400">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>UDP</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '20%'}}></div>
                      </div>
                      <span className="text-sm text-gray-400">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ICMP</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm text-gray-400">10%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>TLS</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm text-gray-400">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI-Powered Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-end">
                  <Button
                    onClick={handleAIAnalysis}
                    disabled={packets.length === 0 || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Comprehensive Report...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Comprehensive Report
                      </>
                    )}
                  </Button>
                </div>

                {analysisReport && (
                  <Accordion type="multiple" value={analysisAccordionOpen} onValueChange={setAnalysisAccordionOpen} className="space-y-2">
                    <AccordionItem value="overview">
                      <AccordionTrigger>Overview</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div><span className="text-gray-400">Total Packets:</span> <span className="ml-2">{analysisReport.overview.totalPackets}</span></div>
                            <div><span className="text-gray-400">Unique Sources:</span> <span className="ml-2">{analysisReport.overview.uniqueSources}</span></div>
                            <div><span className="text-gray-400">Unique Destinations:</span> <span className="ml-2">{analysisReport.overview.uniqueDestinations}</span></div>
                            <div><span className="text-gray-400">Avg Packet Size:</span> <span className="ml-2">{analysisReport.overview.averagePacketSize} bytes</span></div>
                            <div><span className="text-gray-400">Overall Risk:</span> <span className="ml-2">{analysisReport.overview.overallRisk}</span></div>
                            <div><span className="text-gray-400">Time Range:</span> <span className="ml-2">{analysisReport.overview.timeRange}</span></div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="protocols">
                      <AccordionTrigger>Protocol Distribution</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="space-y-2 text-sm">
                            {analysisReport.protocolDistribution.map((p) => (
                              <div key={p.name} className="flex items-center justify-between">
                                <span>{p.name}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-32 bg-gray-800 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${p.pct}%` }}></div>
                                  </div>
                                  <span className="text-gray-400">{p.pct}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="risks">
                      <AccordionTrigger>Risks</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-700 rounded-lg p-4">
                          {analysisReport.risks.length ? (
                            <ul className="ml-1 space-y-2 text-sm">
                              {analysisReport.risks.map((r, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Badge className={severityBadgeClass(r.severity)}>{r.severity}</Badge>
                                  <div>
                                    <div className="font-medium">{r.title}</div>
                                    <div className="text-gray-300">{r.detail}</div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-300">No significant risks detected.</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="findings">
                      <AccordionTrigger>Findings</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-700 rounded-lg p-4">
                          {analysisReport.findings.length ? (
                            <ul className="list-disc ml-5 space-y-1 text-sm">
                              {analysisReport.findings.map((f, i) => (
                                <li key={i}><span className="font-medium">{f.title}:</span> {f.detail}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-300">No noteworthy findings.</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="performance">
                      <AccordionTrigger>Performance</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div><span className="text-gray-400">Peak Time:</span> <span className="ml-2">{analysisReport.performance.peakTime}</span></div>
                            <div><span className="text-gray-400">Bandwidth:</span> <span className="ml-2">{analysisReport.performance.bandwidthUtilization}</span></div>
                            <div><span className="text-gray-400">Latency:</span> <span className="ml-2">{analysisReport.performance.latencyObservations}</span></div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="anomalies">
                      <AccordionTrigger>Anomalies</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <ul className="list-disc ml-5 space-y-1 text-sm">
                            {analysisReport.anomalies.observations.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="recommendations">
                      <AccordionTrigger>Recommendations</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <ul className="list-disc ml-5 space-y-1 text-sm">
                            {analysisReport.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">
                  Export packets to CSV and generate a PDF report that includes the AI-Powered Analysis.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => exportData('csv')}
                    disabled={filteredPackets.length === 0 && !analysisReport}
                    className="h-20 flex-col"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    CSV
                  </Button>



                  <Button
                    variant="outline"
                    onClick={() => exportData('pdf')}
                    disabled={filteredPackets.length === 0 && !analysisReport}
                    className="h-20 flex-col"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    PDF Report
                  </Button>
                </div>

                {analysisReport && (
                  <p className="text-xs text-gray-400">
                    CSV export downloads packets.csv and ai-report.csv.
                  </p>
                )}

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Export Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Packets:</span>
                      <span className="ml-2">{packets.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Filtered Packets:</span>
                      <span className="ml-2">{filteredPackets.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date Range:</span>
                      <span className="ml-2">2025-10-08</span>
                    </div>
                    <div>
                      <span className="text-gray-400">File Size:</span>
                      <span className="ml-2">~1.7KB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals and Overlays */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {selectedPacket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <PacketDetails
              packet={selectedPacket}
              onClose={() => setSelectedPacket(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
