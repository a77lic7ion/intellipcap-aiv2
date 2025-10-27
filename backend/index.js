const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pcapParser = require('pcap-parser');
const fs = require('fs');

const app = express();
const port = 3001;

const PACKET_FILE = './packets.json';

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const readPackets = () => {
  if (fs.existsSync(PACKET_FILE)) {
    const data = fs.readFileSync(PACKET_FILE);
    return JSON.parse(data);
  }
  return [];
};

const writePackets = (packets) => {
  fs.writeFileSync(PACKET_FILE, JSON.stringify(packets, null, 2));
};

const normalizePacket = (packet) => {
  if (!packet || !packet.payload) {
    return null;
  }
  const ip = packet.payload.payload;
  if (!ip) {
    return null;
  }
  const transport = ip.payload;
  return {
    timestamp: new Date(packet.pcap_header.tv_sec * 1000 + packet.pcap_header.tv_usec / 1000).toISOString(),
    source: ip.saddr.addr.join('.'),
    destination: ip.daddr.addr.join('.'),
    protocol: ip.protocolName,
    length: packet.pcap_header.len,
    info: '', // This would require deeper packet inspection
    port: transport?.sport || transport?.dport || null,
  };
};

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/upload', upload.single('pcap'), (req, res) => {
  const packets = readPackets();
  const parser = pcapParser.parse(req.file.path);
  parser.on('packet', (packet) => {
    const normalized = normalizePacket(packet);
    if (normalized) {
      packets.push(normalized);
    }
  });
  parser.on('end', () => {
    fs.unlinkSync(req.file.path);
    writePackets(packets);
    res.send('File uploaded and parsed successfully');
  });
});

app.post('/live-data', (req, res) => {
  const packets = readPackets();
  const normalized = normalizePacket(req.body.packet);
  if (normalized) {
    packets.push(normalized);
  }
  writePackets(packets);
  res.send('Live data received');
});

app.get('/packets', (req, res) => {
  const packets = readPackets();
  res.json(packets);
});

app.post('/clear', (req, res) => {
  writePackets([]);
  res.send('Packets cleared');
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
