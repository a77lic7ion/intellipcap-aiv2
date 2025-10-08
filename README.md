# IntelliPCAP.AI v2 - Advanced Network Packet Analysis

A sophisticated web-based network packet analysis tool with AI-powered insights and real-time visualization capabilities.

## Features

### Core Functionality
- **Live Packet Capture**: Real-time network traffic monitoring with configurable interfaces
- **PCAP File Analysis**: Import and analyze existing packet capture files
- **Advanced Filtering**: BPF (Berkeley Packet Filter) support for precise traffic filtering
- **Multi-Protocol Support**: TCP, UDP, ICMP, HTTP, HTTPS, SSH, DNS, and more

### AI-Powered Analysis
- **Security Threat Detection**: Automated identification of potential security vulnerabilities
- **Performance Analysis**: Network bottleneck detection and optimization recommendations
- **Anomaly Detection**: Unusual traffic pattern identification
- **Google Gemini Integration**: Advanced AI analysis using Google's Gemini API

### Visualization & Reporting
- **Real-time Charts**: Traffic flow visualization with interactive charts
- **Protocol Distribution**: Visual breakdown of network protocols
- **Top Talkers Analysis**: Identification of most active network endpoints
- **Export Capabilities**: CSV, JSON, Excel, and PDF report generation

### User Interface
- **Modern Design**: Clean, professional interface with dark/light theme support
- **Responsive Layout**: Optimized for desktop and tablet devices
- **Interactive Components**: Detailed packet inspection with hex dump view
- **Tabbed Navigation**: Organized workflow with capture, analysis, visualization, and export tabs

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icon library
- **AI Integration**: Google Gemini API
- **Build Tool**: Vite with hot module replacement

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd intellipcap-ai
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure AI Settings**:
   - Obtain a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)
   - Configure the API key in the application settings

4. **Start development server**:
   ```bash
   pnpm run dev
   ```

5. **Build for production**:
   ```bash
   pnpm run build
   ```

## Usage

### Getting Started
1. **Launch the application** and navigate to the main interface
2. **Configure network interface** from the available options (eth0, wlan0, etc.)
3. **Set BPF filters** (optional) to focus on specific traffic types
4. **Start packet capture** or load existing PCAP files

### Live Capture
- Select your network interface from the dropdown
- Apply optional BPF filters (e.g., `tcp port 80` for HTTP traffic)
- Click "Start Capture" to begin real-time monitoring
- View captured packets in the analysis table

### AI Analysis
1. Navigate to the **AI Analysis** tab
2. Select analysis type (Security Threats, Performance, Anomaly Detection)
3. Click "Analyze Packets" to generate AI-powered insights
4. Review detailed recommendations and security findings

### Visualization
- **Traffic Over Time**: Line chart showing packet volume trends
- **Protocol Distribution**: Pie chart of protocol usage
- **Top Talkers**: Bar chart of most active network endpoints

### Export Options
- **CSV**: Raw packet data for spreadsheet analysis
- **JSON**: Structured data for programmatic processing
- **Excel**: Formatted spreadsheet with charts
- **PDF Report**: Professional analysis report with visualizations

## Configuration

### Application Settings
- **Theme**: Toggle between dark and light modes
- **Performance**: Adjust maximum packets to display
- **Capture Settings**: Configure buffer sizes and timeout values

### AI Configuration
- **API Key**: Google Gemini API key for AI analysis
- **Analysis Types**: Enable/disable specific analysis features
- **Privacy**: All data processing occurs locally with secure API communication

### Security Settings
- **Authentication**: Local user management (future feature)
- **Data Privacy**: Packet data never leaves your environment without explicit consent
- **API Security**: Encrypted communication with Google AI services

## API Integration

The application integrates with Google's Gemini AI for advanced packet analysis:

```javascript
// Example AI analysis request
const analysisResult = await analyzePackets({
  packets: capturedData,
  analysisType: 'security',
  apiKey: userApiKey
});
```

## File Structure

```
intellipcap-ai/
├── src/
│   ├── components/
│   │   ├── PacketDetails.jsx      # Detailed packet inspection
│   │   ├── TrafficVisualization.jsx # Charts and graphs
│   │   └── Settings.jsx           # Application configuration
│   ├── App.jsx                    # Main application component
│   ├── App.css                    # Global styles
│   └── main.jsx                   # Application entry point
├── public/
│   └── index.html                 # HTML template
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Development

### Prerequisites
- Node.js 18+ and pnpm package manager
- Modern web browser with JavaScript enabled
- Network interface access for live capture (requires appropriate permissions)

### Development Workflow
1. **Start development server**: `pnpm run dev`
2. **Make changes** to source files
3. **Test functionality** in browser
4. **Build for production**: `pnpm run build`

### Adding New Features
- **Components**: Add new React components in `src/components/`
- **Styling**: Use Tailwind CSS classes for consistent design
- **Charts**: Leverage Recharts for data visualization
- **AI Features**: Extend the Gemini API integration

## Browser Compatibility

- **Chrome/Chromium**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

## Security Considerations

- **Local Processing**: All packet analysis occurs locally
- **API Security**: Secure HTTPS communication with AI services
- **Data Privacy**: No packet data stored on external servers
- **User Consent**: Explicit permission required for AI analysis

## Performance Optimization

- **Packet Limiting**: Configurable maximum packet display count
- **Efficient Rendering**: Virtual scrolling for large datasets
- **Memory Management**: Automatic cleanup of old packet data
- **Chart Optimization**: Responsive chart rendering with data sampling

## Troubleshooting

### Common Issues
1. **Network Interface Access**: Ensure proper permissions for packet capture
2. **AI Analysis Errors**: Verify Google Gemini API key configuration
3. **Performance Issues**: Reduce maximum packet count in settings
4. **Browser Compatibility**: Use a modern browser with JavaScript enabled

### Support
For technical support and feature requests, please refer to the project documentation or contact the development team.

## License

This project is developed as part of the IntelliPCAP.AI v2 network analysis suite. Please refer to the license documentation for usage terms and conditions.

## Acknowledgments

- **Google Gemini AI**: Advanced packet analysis capabilities
- **React Community**: Excellent framework and ecosystem
- **Tailwind CSS**: Beautiful and responsive design system
- **Recharts**: Powerful charting library for data visualization
