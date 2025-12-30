# Project Noah - IoT Sewer Monitoring System

A real-time IoT monitoring dashboard for sewer systems with live map visualization, simulation capabilities, and intelligent alerting.

## Features

### Live Dashboard
- **Interactive Map**: Real-time visualization of all sensor nodes using Leaflet.js
- **Color-Coded Status**: Green markers for normal operation, red for critical alerts
- **Detailed Tooltips**: Hover over nodes to see node name and status. Click to see water level and flow rate data
- **Auto-Scaling**: Responsive map that adjusts to screen size

### Simulation & Testing
- **Real-Time Parameter Adjustment**: Modify water levels and flow rates on the fly
- **Instant Visual Feedback**: Changes immediately reflect on the map and status indicators
- **Status Monitoring**: Visual indicators show normal vs. critical states
- **Table View**: Comprehensive view of all nodes with editable parameters

### Control Panel
- **Global Threshold Management**: Set critical water level and water flow thresholds system-wide
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

## Usage Guide

### Login
- Username: admin
- Password: admin

### Dashboard Tab
1. View all sensor nodes on the interactive map
2. Hover over markers to see detailed information
3. Green markers indicate normal operation
4. Red markers indicate critical water levels or water flow

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


**Project Noah** - Monitoring the flow, protecting the future.
