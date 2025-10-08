import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

const timeSeriesData = [
  { time: '10:15:20', packets: 12, bytes: 1024 },
  { time: '10:15:21', packets: 18, bytes: 1536 },
  { time: '10:15:22', packets: 25, bytes: 2048 },
  { time: '10:15:23', packets: 32, bytes: 2560 },
  { time: '10:15:24', packets: 28, bytes: 2304 },
  { time: '10:15:25', packets: 22, bytes: 1792 },
  { time: '10:15:26', packets: 15, bytes: 1280 },
]

const protocolData = [
  { name: 'TCP', value: 60, color: '#3b82f6' },
  { name: 'UDP', value: 20, color: '#10b981' },
  { name: 'ICMP', value: 10, color: '#f59e0b' },
  { name: 'TLS', value: 10, color: '#8b5cf6' },
]

const topTalkersData = [
  { ip: '192.168.1.100', packets: 45, bytes: 3840 },
  { ip: '8.8.8.8', packets: 32, bytes: 2560 },
  { ip: '192.168.1.1', packets: 28, bytes: 2240 },
  { ip: '10.0.0.5', packets: 15, bytes: 1200 },
  { ip: '443.ssl.fastly.com', packets: 12, bytes: 960 },
]

export function TrafficVisualization() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Traffic Over Time */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Traffic Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="packets" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Protocol Distribution */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Protocol Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={protocolData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {protocolData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {protocolData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Talkers */}
      <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Talkers</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTalkersData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number"
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="ip"
                stroke="#9ca3af"
                fontSize={12}
                width={120}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="packets" 
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
