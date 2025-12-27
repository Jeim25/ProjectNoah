# Project Noah - IoT Sewer Monitoring System

A real-time IoT monitoring dashboard for sewer systems with live map visualization, simulation capabilities, and intelligent alerting.

## Features

### Live Dashboard
- **Interactive Map**: Real-time visualization of all sensor nodes using Leaflet.js
- **Color-Coded Status**: Green markers for normal operation, red for critical alerts
- **Detailed Tooltips**: Hover over nodes to see water level and flow rate data
- **Auto-Scaling**: Responsive map that adjusts to screen size

### Simulation & Testing
- **Real-Time Parameter Adjustment**: Modify water levels and flow rates on the fly
- **Instant Visual Feedback**: Changes immediately reflect on the map and status indicators
- **Status Monitoring**: Visual indicators show normal vs. critical states
- **Table View**: Comprehensive view of all nodes with editable parameters

### Control Panel
- **Global Threshold Management**: Set critical water level thresholds system-wide
- **Dynamic Recalibration**: Updates apply immediately to all nodes
- **Visual Guidance**: Clear information about threshold impacts

### Notifications
- **Critical Alerts**: Automatic notifications when nodes exceed thresholds
- **Timestamped Logs**: Track when events occurred
- **Event History**: Complete log of all critical alerts

## Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Custom styling with Tailwind CSS framework
- **Vanilla JavaScript**: Pure JavaScript for state management and interactivity
- **Leaflet.js**: Open-source mapping library
- **Font Awesome**: Icon library
- **Google Fonts (Inter)**: Modern typography

## File Structure

```
project-noah/
├── index.html          # Main HTML structure
├── styles.css          # Custom CSS styles
├── script.js           # Application logic and state management
└── README.md           # Documentation
```

## Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection (for CDN resources)

### Quick Start

1. **Clone or Download** the repository:
   ```bash
   git clone <repository-url>
   cd project-noah
   ```

2. **Open the Application**:
   - Simply open `index.html` in your web browser
   - Or use a local development server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server
     ```

3. **Access the Dashboard**:
   - Navigate to `http://localhost:8000` (if using a server)
   - Or open the file directly in your browser

## Usage Guide

### Dashboard Tab
1. View all sensor nodes on the interactive map
2. Hover over markers to see detailed information
3. Green markers indicate normal operation
4. Red markers indicate critical water levels

### Simulation Tab
1. Click on the "Simulation" tab in the sidebar
2. Adjust water level values using the input fields
3. Modify flow rates to simulate different conditions
4. Observe real-time status changes in the table
5. Watch map markers update automatically

### Control Panel Tab
1. Navigate to the "Control Panel" tab
2. Adjust the global critical threshold value
3. Click outside the input or press Enter to apply
4. All nodes will be re-evaluated against the new threshold
5. New critical alerts will be generated if needed

### Notifications Tab
1. View all critical alerts in chronological order
2. Each notification shows the node name, water level, and timestamp
3. Notifications are generated when nodes cross the critical threshold
4. Most recent alerts appear at the top

## Configuration

### Adding New Nodes

Edit the `state.nodes` array in `script.js`:

```javascript
const state = {
  nodes: [
    { 
      id: 6, 
      name: "Node Zeta", 
      lat: 40.7500, 
      lng: -73.9700, 
      waterLevel: 4.0, 
      waterFlow: 2.0 
    },
    // ... existing nodes
  ]
}
```

### Modifying Default Threshold

Change the `globalThreshold` value in `script.js`:

```javascript
const state = {
  globalThreshold: 5.0, // Change this value (in meters)
  // ...
}
```

### Customizing Colors

Modify the marker colors in the `addMarker()` function in `script.js`:

```javascript
const color = isCritical ? "#f43f5e" : "#10b981" // Red : Green
```

### Adjusting Map Center

Change the initial map view in the `initMap()` function:

```javascript
state.map = L.map("map").setView([40.7489, -73.968], 12)
// [latitude, longitude], zoom level
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- The application uses efficient state management with centralized data
- Map markers are updated only when necessary
- No unnecessary re-renders or DOM manipulations
- Lightweight dependencies loaded from CDN

## Troubleshooting

### Map Not Displaying
- Check internet connection (Leaflet and OpenStreetMap require internet)
- Ensure JavaScript is enabled in your browser
- Check browser console for errors (F12)

### Markers Not Updating
- Verify that changes are being saved (check browser console)
- Refresh the page and try again
- Clear browser cache if issues persist

### Styling Issues
- Ensure all CDN links are accessible
- Check if Tailwind CSS is loaded properly
- Verify custom `styles.css` is linked correctly

## Future Enhancements

- Backend integration with real IoT sensors
- Historical data visualization and analytics
- User authentication and role-based access
- Mobile-responsive design improvements
- Export data to CSV/PDF reports
- SMS/Email notifications for critical alerts
- Dark mode support
- Multi-language support

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue in the repository
- Contact the development team

## Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js community for excellent documentation
- Font Awesome for comprehensive icon library
- Tailwind CSS for utility-first CSS framework

---

**Project Noah** - Monitoring the flow, protecting the future.
