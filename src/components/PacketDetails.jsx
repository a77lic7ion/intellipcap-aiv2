import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'

export function PacketDetails({ packet, onClose }) {
  if (!packet) return null

  const hexData = "4500 003c 1c46 4000 4006 b1e6 ac11 0a63 ac11 0a0c 0050 005b 9a69 0d5d 0000 0000 a002 72b0 e5be 0000 0204 05b4 0402 080a 0000 0000 0000 0000 0103 0307"
  
  const formatHex = (hex) => {
    return hex.match(/.{1,4}/g)?.join(' ') || hex
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Packet Details - #{packet.id}</CardTitle>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="hex">Hex Dump</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="font-mono">{packet.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Length:</span>
                    <span>{packet.length} bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protocol:</span>
                    <Badge variant="secondary">{packet.protocol}</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Network Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source:</span>
                    <span className="font-mono">{packet.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Destination:</span>
                    <span className="font-mono">{packet.destination}</span>
                  </div>
                  {packet.port && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Port:</span>
                      <span>{packet.port}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                {packet.info}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="space-y-4">
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="font-semibold mb-2">Ethernet Header</h4>
                <div className="text-sm space-y-1 font-mono">
                  <div>Destination: 00:1b:21:3c:69:68</div>
                  <div>Source: 00:0c:29:68:4c:a5</div>
                  <div>Type: IPv4 (0x0800)</div>
                </div>
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="font-semibold mb-2">IP Header</h4>
                <div className="text-sm space-y-1 font-mono">
                  <div>Version: 4</div>
                  <div>Header Length: 20 bytes</div>
                  <div>Type of Service: 0x00</div>
                  <div>Total Length: {packet.length}</div>
                  <div>Identification: 0x1c46</div>
                  <div>Flags: 0x4000</div>
                  <div>TTL: 64</div>
                  <div>Protocol: {packet.protocol}</div>
                  <div>Source: {packet.source}</div>
                  <div>Destination: {packet.destination}</div>
                </div>
              </div>
              
              {packet.protocol === 'TCP' && (
                <div className="bg-gray-700 p-3 rounded">
                  <h4 className="font-semibold mb-2">TCP Header</h4>
                  <div className="text-sm space-y-1 font-mono">
                    <div>Source Port: {Math.floor(Math.random() * 65535)}</div>
                    <div>Destination Port: {packet.port || 80}</div>
                    <div>Sequence Number: 0x9a690d5d</div>
                    <div>Acknowledgment: 0x00000000</div>
                    <div>Flags: SYN</div>
                    <div>Window Size: 29360</div>
                    <div>Checksum: 0xe5be</div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="hex" className="space-y-4">
            <ScrollArea className="h-64 bg-gray-700 p-3 rounded">
              <div className="font-mono text-xs space-y-1">
                {formatHex(hexData).match(/.{1,48}/g)?.map((line, index) => (
                  <div key={index} className="flex">
                    <span className="text-gray-400 w-12">
                      {(index * 16).toString(16).padStart(4, '0')}:
                    </span>
                    <span className="ml-2">{line}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
