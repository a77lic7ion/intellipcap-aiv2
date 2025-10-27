const pcap = require('pcap');
const axios = require('axios');
const os = require('os');

const interfaces = os.networkInterfaces();
const activeInterface = Object.keys(interfaces).find(
  (iface) =>
    iface !== 'lo' &&
    interfaces[iface].some((details) => details.family === 'IPv4' && !details.internal)
);

if (!activeInterface) {
  console.error('No active network interface found.');
  process.exit(1);
}

const pcap_session = pcap.createSession(activeInterface, { filter: '' });
const backendUrl = 'http://localhost:3001/live-data';

pcap_session.on('packet', (raw_packet) => {
  const packet = pcap.decode.packet(raw_packet);
  axios.post(backendUrl, { packet })
    .then(response => {
      console.log('Packet sent to backend:', response.data);
    })
    .catch(error => {
      console.error('Error sending packet to backend:', error.message);
    });
});
