// Global states
const state = {
  isAuthenticated: false,
  isGuest: false,
  globalThreshold: 5.0,
  flowThreshold: 1.0,
  levelWarningsEnabled: true,
  flowWarningsEnabled: true,
  dataSimulationInterval: null,
  typhoonSimulationInterval: null,
  isTyphoonActive: false,
  nodes: [
    { id: 1, name: "PUP Main Gate", lat: 14.599163, lng: 121.01187, waterLevel: 3.2, waterFlow: 1.5 },
    { id: 2, name: "South Wing", lat: 14.598463, lng: 121.01217, waterLevel: 4.8, waterFlow: 2.1 },
    { id: 3, name: "North Wing", lat: 14.599863, lng: 121.01157, waterLevel: 6.2, waterFlow: 3.4 },
    { id: 4, name: "East Campus", lat: 14.598663, lng: 121.01247, waterLevel: 2.9, waterFlow: 1.2 },
    { id: 5, name: "West Campus", lat: 14.599463, lng: 121.01097, waterLevel: 5.5, waterFlow: 2.8 },
    { id: 6, name: "Library Area", lat: 14.598763, lng: 121.01187, waterLevel: 3.8, waterFlow: 1.8 },
    { id: 7, name: "Gymnasium", lat: 14.600163, lng: 121.01207, waterLevel: 4.2, waterFlow: 2.0 },
    { id: 8, name: "Covered Courts", lat: 14.598163, lng: 121.01147, waterLevel: 5.8, waterFlow: 0.6 },
    { id: 9, name: "Engineering Bldg", lat: 14.599363, lng: 121.01227, waterLevel: 3.5, waterFlow: 1.6 },
    { id: 10, name: "Business Bldg", lat: 14.599663, lng: 121.01167, waterLevel: 4.5, waterFlow: 2.2 },
    { id: 11, name: "Science Complex", lat: 14.598563, lng: 121.01207, waterLevel: 6.5, waterFlow: 3.2 },
    { id: 12, name: "Arts Building", lat: 14.598963, lng: 121.01107, waterLevel: 3.0, waterFlow: 1.4 },
    { id: 13, name: "Student Center", lat: 14.600063, lng: 121.01187, waterLevel: 5.2, waterFlow: 2.5 },
    { id: 14, name: "Sports Complex", lat: 14.598863, lng: 121.01177, waterLevel: 4.0, waterFlow: 0.8 },
    { id: 15, name: "Admin Building", lat: 14.599563, lng: 121.01137, waterLevel: 3.7, waterFlow: 1.7 },
  ],
  notifications: [],
  map: null,
  markers: {},
  addNodeMap: null,
  typhoonSimulation: {
    active: false,
    scenario: null,
    intensity: null,
    startTime: null,
    totalDuration: null,
  },
}

// Import leaflet
const L = window.L

function updateClock() {
  const now = new Date()

  const timeOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }
  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" }

  const timeString = now.toLocaleTimeString("en-US", timeOptions)
  const dateString = now.toLocaleDateString("en-US", dateOptions)

  const dashboardTime = document.getElementById("dashboard-time")
  const dashboardDate = document.getElementById("dashboard-date")
  if (dashboardTime) dashboardTime.textContent = timeString
  if (dashboardDate) dashboardDate.textContent = dateString

  const simulationTime = document.getElementById("simulation-time")
  const simulationDate = document.getElementById("simulation-date")
  if (simulationTime) simulationTime.textContent = timeString
  if (simulationDate) simulationDate.textContent = dateString
}

function startDataSimulation() {
  if (state.dataSimulationInterval) {
    clearInterval(state.dataSimulationInterval)
  }

  state.dataSimulationInterval = setInterval(() => {
    if (state.isTyphoonActive) return

    state.nodes.forEach((node) => {
      const levelChange = (Math.random() - 0.5) * 0.4
      node.waterLevel = Math.max(0, Math.min(10, node.waterLevel + levelChange))

      const flowChange = (Math.random() - 0.5) * 0.2
      node.waterFlow = Math.max(0, Math.min(5, node.waterFlow + flowChange))

      if (state.levelWarningsEnabled && node.waterLevel > state.globalThreshold) {
        const wasCritical = node.waterLevel - levelChange <= state.globalThreshold
        if (wasCritical) {
          addNotification(`${node.name} reached critical level (${node.waterLevel.toFixed(1)}m)`)
        }
      }

      if (state.flowWarningsEnabled && node.waterFlow < state.flowThreshold) {
        const wasNormal = node.waterFlow - flowChange >= state.flowThreshold
        if (wasNormal) {
          addNotification(`${node.name} flow rate dropped below threshold (${node.waterFlow.toFixed(1)}m/s)`)
        }
      }
    })

    updateAllMarkers()
    renderSimulationTable()
    saveStateToLocalStorage()
  }, 3000)
}

function showTyphoonModal() {
  if (!state.isAuthenticated) {
    alert("Please login to simulate typhoon")
    return
  }

  document.getElementById("typhoon-modal").classList.remove("hidden")
}

function closeTyphoonModal() {
  document.getElementById("typhoon-modal").classList.add("hidden")
}

function handleTyphoonSimulation(event) {
  event.preventDefault()

  if (!state.isAuthenticated) {
    alert("Please login to simulate typhoon")
    return
  }

  const scenario = document.getElementById("typhoon-scenario").value
  const duration = Number.parseInt(document.getElementById("typhoon-duration").value) * 1000
  const intensity = document.getElementById("typhoon-intensity").value

  closeTyphoonModal()

  startTyphoonSimulation(scenario, duration, intensity)
}

function startTyphoonSimulation(scenario, duration, intensity) {
  state.isTyphoonActive = true
  state.typhoonSimulation.active = true
  state.typhoonSimulation.scenario = { name: scenario }
  state.typhoonSimulation.intensity = intensity.charAt(0).toUpperCase() + intensity.slice(1)
  state.typhoonSimulation.startTime = Date.now()
  state.typhoonSimulation.totalDuration = duration

  const typhoonStatusSim = document.getElementById("typhoon-status-card")
  const typhoonStatusDash = document.getElementById("dashboard-typhoon-status-card")

  if (typhoonStatusSim) {
    typhoonStatusSim.classList.remove("hidden")
  }

  if (typhoonStatusDash) {
    typhoonStatusDash.classList.remove("hidden")
  }

  const intensityMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2.5,
  }[intensity]

  addNotification(`🌪️ Typhoon simulation started: ${scenario} (${intensity} intensity)`)

  const updateInterval = 500

  const originalValues = state.nodes.map((node) => ({
    id: node.id,
    waterLevel: node.waterLevel,
    waterFlow: node.waterFlow,
  }))

  state.typhoonSimulationInterval = setInterval(() => {
    const elapsed = Date.now() - state.typhoonSimulation.startTime
    const progress = elapsed / duration

    if (progress >= 1) {
      clearInterval(state.typhoonSimulationInterval)
      state.isTyphoonActive = false
      state.typhoonSimulation.active = false
      const typhoonStatus = document.getElementById("typhoon-status-card")
      const typhoonStatusDash = document.getElementById("dashboard-typhoon-status-card")
      if (typhoonStatus) {
        typhoonStatus.classList.add("hidden")
      }
      if (typhoonStatusDash) {
        typhoonStatusDash.classList.add("hidden")
      }
      addNotification(`✅ Typhoon simulation completed`)
      return
    }

    state.nodes.forEach((node, index) => {
      const original = originalValues[index]

      switch (scenario) {
        case "heavy-rain":
          node.waterLevel = original.waterLevel + progress * 4 * intensityMultiplier
          node.waterFlow = original.waterFlow + progress * 2 * intensityMultiplier
          break

        case "flash-flood":
          if (progress < 0.2) {
            node.waterLevel = original.waterLevel + progress * 20 * intensityMultiplier
            node.waterFlow = original.waterFlow + progress * 10 * intensityMultiplier
          } else {
            node.waterLevel = original.waterLevel + 4 * intensityMultiplier
            node.waterFlow = original.waterFlow + 2 * intensityMultiplier
          }
          break

        case "blockage":
          if (progress < 0.3) {
            node.waterFlow = original.waterFlow * (1 - progress * 3)
          } else if (progress < 0.7) {
            node.waterFlow = 0
            node.waterLevel = original.waterLevel + (progress - 0.3) * 5 * intensityMultiplier
          } else {
            node.waterFlow = (progress - 0.7) * 3 * original.waterFlow
            node.waterLevel = Math.max(original.waterLevel, node.waterLevel - 0.1)
          }
          break

        case "recovery":
          const targetLevel = 3.5
          const targetFlow = 1.5
          node.waterLevel = node.waterLevel + (targetLevel - node.waterLevel) * progress * 0.5
          node.waterFlow = node.waterFlow + (targetFlow - node.waterFlow) * progress * 0.5
          break
      }

      node.waterLevel = Math.max(0, Math.min(10, node.waterLevel))
      node.waterFlow = Math.max(0, Math.min(5, node.waterFlow))
    })

    updateAllMarkers()
    renderSimulationTable()
    updateTyphoonStatusCard()
  }, updateInterval)
}

function stopTyphoonSimulation() {
  if (state.typhoonSimulationInterval) {
    clearInterval(state.typhoonSimulationInterval)
    state.typhoonSimulationInterval = null
  }
  state.isTyphoonActive = false
  state.typhoonSimulation.active = false

  const typhoonStatus = document.getElementById("typhoon-status-card")
  const typhoonStatusDash = document.getElementById("dashboard-typhoon-status-card")
  if (typhoonStatus) {
    typhoonStatus.classList.add("hidden")
  }
  if (typhoonStatusDash) {
    typhoonStatusDash.classList.add("hidden")
  }

  addNotification("⛔ Typhoon simulation stopped manually")
}

function saveStateToLocalStorage() {
  const stateToSave = {
    globalThreshold: state.globalThreshold,
    flowThreshold: state.flowThreshold,
    levelWarningsEnabled: state.levelWarningsEnabled,
    flowWarningsEnabled: state.flowWarningsEnabled,
    nodes: state.nodes,
    notifications: state.notifications,
    dataSimulationInterval: state.dataSimulationInterval,
    typhoonSimulationInterval: state.typhoonSimulationInterval,
    isTyphoonActive: state.isTyphoonActive,
    typhoonSimulation: state.typhoonSimulation,
  }
  localStorage.setItem("projectNoahState", JSON.stringify(stateToSave))
}

function loadStateFromLocalStorage() {
  const savedState = localStorage.getItem("projectNoahState")
  if (savedState) {
    const parsed = JSON.parse(savedState)
    state.globalThreshold = parsed.globalThreshold || 5.0
    state.flowThreshold = parsed.flowThreshold || 1.0
    state.levelWarningsEnabled = parsed.levelWarningsEnabled !== undefined ? parsed.levelWarningsEnabled : true
    state.flowWarningsEnabled = parsed.flowWarningsEnabled !== undefined ? parsed.flowWarningsEnabled : true
    state.nodes = parsed.nodes || state.nodes
    state.notifications = parsed.notifications || []
    state.dataSimulationInterval = parsed.dataSimulationInterval || null
    state.typhoonSimulationInterval = parsed.typhoonSimulationInterval || null
    state.isTyphoonActive = parsed.isTyphoonActive || false
    state.typhoonSimulation = parsed.typhoonSimulation || state.typhoonSimulation

    document.getElementById("threshold-input").value = state.globalThreshold
    document.getElementById("flow-threshold-input").value = state.flowThreshold
    document.getElementById("level-warnings-toggle").checked = state.levelWarningsEnabled
    document.getElementById("flow-warnings-toggle").checked = state.flowWarningsEnabled
  }
}

function handleGuest() {
  state.isGuest = true
  state.isAuthenticated = false
  document.getElementById("login-modal").classList.add("hidden")
  updateUIForAuthState()
}

function handleLogin(event) {
  event.preventDefault()

  const username = document.getElementById("login-username").value
  const password = document.getElementById("login-password").value

  if (username === "admin" && password === "admin") {
    state.isAuthenticated = true
    state.isGuest = false
    document.getElementById("login-modal").classList.add("hidden")
    document.getElementById("login-error").classList.add("hidden")
    updateUIForAuthState()
  } else {
    document.getElementById("login-error").classList.remove("hidden")
  }
}

function handleLogout() {
  state.isAuthenticated = false
  state.isGuest = false
  document.getElementById("login-modal").classList.remove("hidden")
  document.getElementById("login-username").value = ""
  document.getElementById("login-password").value = ""
  document.getElementById("login-error").classList.add("hidden")
  updateUIForAuthState()
}

function updateUIForAuthState() {
  const simulationTab = document.getElementById("content-simulation")

  if (!state.isAuthenticated && state.isGuest) {
    if (simulationTab && !simulationTab.classList.contains("hidden")) {
      switchTab("dashboard")
    }
  }

  const logoutButtonText = document.getElementById("logout-button-text")
  if (logoutButtonText) {
    logoutButtonText.textContent = state.isAuthenticated ? "Log Out" : "Log In"
  }

  const dashboardAddNodeBtn = document.getElementById("dashboard-add-node-btn")
  if (dashboardAddNodeBtn) {
    dashboardAddNodeBtn.style.display = state.isAuthenticated ? "flex" : "none"
  }

  renderSimulationTable()
  updateAllMarkers()
}

function checkAuthentication() {
  if (!state.isAuthenticated) {
    alert("Please login to perform this action")
    return false
  }
  return true
}

function initMap() {
  state.map = L.map("map").setView([14.599163, 121.01187], 16)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(state.map)

  state.nodes.forEach((node) => {
    addMarker(node)
  })
}

function addMarker(node) {
  const isLevelCritical = state.levelWarningsEnabled && node.waterLevel > state.globalThreshold
  const isFlowCritical = state.flowWarningsEnabled && node.waterFlow < state.flowThreshold
  const isCritical = isLevelCritical || isFlowCritical
  const color = isCritical ? "#991b1b" : "#10b981"

  if (state.markers[node.id]) {
    state.map.removeLayer(state.markers[node.id])
  }

  const icon = L.divIcon({
    className: "custom-marker",
    html: `<div style="
            width: 28px;
            height: 28px;
            background-color: ${color};
            border: 4px solid #1f2937;
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  const marker = L.marker([node.lat, node.lng], { icon }).addTo(state.map)

  const statusText = isCritical ? "Critical" : "Normal"
  marker.bindTooltip(`<strong>${node.name}</strong><br/>Status: ${statusText}`, {
    direction: "top",
    offset: [0, -15],
  })

  marker.bindPopup(createNodePopup(node), {
    maxWidth: 300,
    className: "node-popup",
    autoPan: false,
    closeButton: true,
    autoClose: false,
    closeOnClick: false,
  })

  marker.on("click", function () {
    this.openPopup()
  })

  state.markers[node.id] = marker
}

function createNodePopup(node) {
  const isLevelCritical = state.levelWarningsEnabled && node.waterLevel > state.globalThreshold
  const isFlowCritical = state.flowWarningsEnabled && node.waterFlow < state.flowThreshold
  const isCritical = isLevelCritical || isFlowCritical
  const statusColor = isCritical ? "text-red-900 bg-red-50" : "text-green-700 bg-green-50"
  const statusText = isCritical ? "Critical" : "Normal"

  return `
    <div style="font-family: Inter, sans-serif; padding: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0;">${node.name}</h3>
        <span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;" class="${statusColor}">
          ${statusText}
        </span>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Node Name:</div>
        <input 
          type="text" 
          id="popup-name-${node.id}" 
          value="${node.name}" 
          style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;"
          ${!state.isAuthenticated ? "disabled" : ""}
        />
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Water Level (m):</div>
        <input 
          type="number" 
          step="0.1" 
          id="popup-level-${node.id}" 
          value="${node.waterLevel.toFixed(1)}" 
          style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;"
          ${!state.isAuthenticated ? "disabled" : ""}
        />
      </div>
      
      <div style="margin-bottom: 12px;">
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Flow Rate (m/s):</div>
        <input 
          type="number" 
          step="0.1" 
          id="popup-flow-${node.id}" 
          value="${node.waterFlow.toFixed(1)}" 
          style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;"
          ${!state.isAuthenticated ? "disabled" : ""}
        />
      </div>
      
      ${
        state.isAuthenticated
          ? `
        <button 
          onclick="saveNodeFromPopup(${node.id})" 
          style="width: 100%; padding: 8px; background-color: #0ea5e9; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;"
        >
          Save Changes
        </button>
      `
          : `
        <div style="padding: 8px; background-color: #fef3c7; border: 1px solid #fde047; border-radius: 6px; font-size: 11px; color: #92400e; text-align: center;">
          <i class="fas fa-lock" style="margin-right: 4px;"></i>
          Login to edit node data
        </div>
      `
      }
    </div>
  `
}

function saveNodeFromPopup(nodeId) {
  if (!state.isAuthenticated) {
    alert("Please login to edit node data")
    return
  }

  const node = state.nodes.find((n) => n.id === nodeId)
  const newName = document.getElementById(`popup-name-${nodeId}`).value
  const newLevel = Number.parseFloat(document.getElementById(`popup-level-${nodeId}`).value)
  const newFlow = Number.parseFloat(document.getElementById(`popup-flow-${nodeId}`).value)

  const oldLevel = node.waterLevel
  const oldFlow = node.waterFlow
  const oldName = node.name

  node.name = newName
  node.waterLevel = newLevel
  node.waterFlow = newFlow

  if (state.levelWarningsEnabled) {
    const wasCritical = oldLevel > state.globalThreshold
    const isCritical = newLevel > state.globalThreshold

    if (!wasCritical && isCritical) {
      addNotification(`${node.name} reached critical level (${node.waterLevel.toFixed(1)}m)`)
    }
  }

  if (state.flowWarningsEnabled) {
    const wasLowFlow = oldFlow < state.flowThreshold
    const isLowFlow = newFlow < state.flowThreshold

    if (!wasLowFlow && isLowFlow) {
      addNotification(`${node.name} flow rate dropped below threshold (${node.waterFlow.toFixed(1)}m/s)`)
    }
  }

  if (oldName !== newName) {
    addNotification(`Node renamed from "${oldName}" to "${newName}"`)
  }

  updateAllMarkers()
  renderSimulationTable()

  saveStateToLocalStorage()

  state.markers[nodeId].closePopup()

  addNotification(`${node.name} data updated successfully`)
}

function updateAllMarkers() {
  state.nodes.forEach((node) => {
    const marker = state.markers[node.id]
    const wasOpen = marker && marker.isPopupOpen()

    addMarker(node)

    if (wasOpen) {
      state.markers[node.id].openPopup()
    }
  })
}

function switchTab(tabName) {
  if (tabName === "simulation" && !state.isAuthenticated && state.isGuest) {
    alert("Please login to access the Simulation tab")
    return
  }

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden")
  })

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("tab-active")
    button.classList.add("text-gray-600", "hover:bg-gray-50")
  })

  document.getElementById(`content-${tabName}`).classList.remove("hidden")

  const activeButton = document.getElementById(`tab-${tabName}`)
  activeButton.classList.add("tab-active")
  activeButton.classList.remove("text-gray-600", "hover:bg-gray-50")

  if (tabName === "dashboard" && state.map) {
    setTimeout(() => {
      state.map.invalidateSize()
    }, 100)
  }
}

function renderSimulationTable() {
  const tbody = document.getElementById("simulation-table")

  if (!state.isAuthenticated && state.isGuest) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-lock text-amber-500 text-2xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-1">Simulation Locked</h3>
              <p class="text-sm text-gray-600">Please login to access simulation features</p>
            </div>
          </div>
        </td>
      </tr>
    `
    return
  }

  tbody.innerHTML = state.nodes
    .map((node) => {
      const isLevelCritical = state.levelWarningsEnabled && node.waterLevel > state.globalThreshold
      const isFlowCritical = state.flowWarningsEnabled && node.waterFlow < state.flowThreshold
      const isCritical = isLevelCritical || isFlowCritical
      const statusColor = isCritical ? "text-red-900 bg-red-50" : "text-green-700 bg-green-50"
      const statusText = isCritical ? "Critical" : "Normal"
      const disabled = !state.isAuthenticated ? "disabled" : ""

      return `
            <tr class="hover:bg-gray-50 transition-all">
                <td class="px-6 py-4 font-medium text-gray-800">${node.name}</td>
                <td class="px-6 py-4">
                    <input 
                        type="number" 
                        step="0.1" 
                        value="${node.waterLevel.toFixed(1)}"
                        class="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg transition-all"
                        onchange="updateNodeLevel(${node.id}, this.value)"
                        ${disabled}
                    />
                </td>
                <td class="px-6 py-4">
                    <input 
                        type="number" 
                        step="0.1" 
                        value="${node.waterFlow.toFixed(1)}"
                        class="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg transition-all"
                        onchange="updateNodeFlow(${node.id}, this.value)"
                        ${disabled}
                    />
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button 
                        onclick="removeNode(${node.id})" 
                        class="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all"
                        ${disabled}
                    >
                        <i class="fas fa-trash-alt mr-1"></i>
                        Remove
                    </button>
                </td>
            </tr>
        `
    })
    .join("")
}

function updateNodeLevel(nodeId, newLevel) {
  if (!state.isAuthenticated) {
    alert("Please login to edit node data")
    return
  }

  const node = state.nodes.find((n) => n.id === nodeId)
  const oldLevel = node.waterLevel
  node.waterLevel = Number.parseFloat(newLevel)

  if (state.levelWarningsEnabled) {
    const wasCritical = oldLevel > state.globalThreshold
    const isCritical = node.waterLevel > state.globalThreshold

    if (!wasCritical && isCritical) {
      addNotification(`${node.name} reached critical level (${node.waterLevel.toFixed(1)}m)`)
    }
  }

  updateAllMarkers()
  renderSimulationTable()

  saveStateToLocalStorage()
}

function updateNodeFlow(nodeId, newFlow) {
  if (!state.isAuthenticated) {
    alert("Please login to edit node data")
    return
  }

  const node = state.nodes.find((n) => n.id === nodeId)
  const oldFlow = node.waterFlow
  node.waterFlow = Number.parseFloat(newFlow)

  if (state.flowWarningsEnabled) {
    const wasLowFlow = oldFlow < state.flowThreshold
    const isLowFlow = node.waterFlow < state.flowThreshold

    if (!wasLowFlow && isLowFlow) {
      addNotification(`${node.name} flow rate dropped below threshold (${node.waterFlow.toFixed(1)}m/s)`)
    }
  }

  updateAllMarkers()

  saveStateToLocalStorage()
}

function updateThreshold() {
  const newThreshold = Number.parseFloat(document.getElementById("threshold-input").value)
  state.globalThreshold = newThreshold

  updateAllMarkers()
  renderSimulationTable()

  addNotification(`Global threshold updated to ${newThreshold.toFixed(1)}m`)

  saveStateToLocalStorage()
}

function updateFlowThreshold() {
  const newThreshold = Number.parseFloat(document.getElementById("flow-threshold-input").value)
  state.flowThreshold = newThreshold
  updateAllMarkers()
  renderSimulationTable()
  addNotification(`Flow threshold updated to ${newThreshold.toFixed(1)}m/s`)

  saveStateToLocalStorage()
}

function toggleLevelWarnings() {
  state.levelWarningsEnabled = document.getElementById("level-warnings-toggle").checked
  const status = state.levelWarningsEnabled ? "enabled" : "disabled"
  updateAllMarkers()
  renderSimulationTable()
  addNotification(`Water level warnings ${status}`)

  saveStateToLocalStorage()
}

function toggleFlowWarnings() {
  state.flowWarningsEnabled = document.getElementById("flow-warnings-toggle").checked
  const status = state.flowWarningsEnabled ? "enabled" : "disabled"
  updateAllMarkers()
  renderSimulationTable()
  addNotification(`Water flow warnings ${status}`)

  saveStateToLocalStorage()
}

function removeNode(nodeId) {
  if (!state.isAuthenticated) {
    alert("Please login to remove nodes")
    return
  }

  const node = state.nodes.find((n) => n.id === nodeId)
  if (!node) return

  if (confirm(`Are you sure you want to remove "${node.name}"? This action cannot be undone.`)) {
    state.nodes = state.nodes.filter((n) => n.id !== nodeId)

    if (state.markers[nodeId]) {
      state.map.removeLayer(state.markers[nodeId])
      delete state.markers[nodeId]
    }

    renderSimulationTable()

    addNotification(`Node "${node.name}" has been removed`)

    saveStateToLocalStorage()
  }
}

function showAddNodeModal() {
  if (!state.isAuthenticated) {
    alert("Please login to add nodes")
    return
  }

  document.getElementById("add-node-modal").classList.remove("hidden")

  if (!state.addNodeMap) {
    setTimeout(() => {
      state.addNodeMap = L.map("add-node-map").setView([14.599163, 121.01187], 16)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(state.addNodeMap)

      state.nodes.forEach((node) => {
        const color = node.waterLevel > state.globalThreshold ? "#991b1b" : "#10b981"
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
                    width: 24px;
                    height: 24px;
                    background-color: ${color};
                    border: 3px solid #1f2937;
                    border-radius: 50%;
                    opacity: 0.5;
                "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        L.marker([node.lat, node.lng], { icon }).addTo(state.addNodeMap)
      })

      let tempMarker = null
      state.addNodeMap.on("click", (e) => {
        if (tempMarker) {
          state.addNodeMap.removeLayer(tempMarker)
        }

        tempMarker = L.marker([e.latlng.lat, e.latlng.lng], {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="
                        width: 28px;
                        height: 28px;
                        background-color: #10b981;
                        border: 4px solid #1f2937;
                        border-radius: 50%;
                        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                    "></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        }).addTo(state.addNodeMap)

        document.getElementById("new-node-lat").value = e.latlng.lat.toFixed(6)
        document.getElementById("new-node-lng").value = e.latlng.lng.toFixed(6)
      })
    }, 100)
  } else {
    setTimeout(() => {
      state.addNodeMap.invalidateSize()
    }, 100)
  }
}

function closeAddNodeModal() {
  document.getElementById("add-node-modal").classList.add("hidden")
  document.getElementById("add-node-form").reset()
}

function handleAddNode(event) {
  event.preventDefault()

  const name = document.getElementById("new-node-name").value
  const lat = Number.parseFloat(document.getElementById("new-node-lat").value)
  const lng = Number.parseFloat(document.getElementById("new-node-lng").value)
  const level = Number.parseFloat(document.getElementById("new-node-level").value)
  const flow = Number.parseFloat(document.getElementById("new-node-flow").value)

  const newNode = {
    id: Math.max(...state.nodes.map((n) => n.id)) + 1,
    name,
    lat,
    lng,
    waterLevel: level,
    waterFlow: flow,
  }

  state.nodes.push(newNode)

  addMarker(newNode)

  renderSimulationTable()

  closeAddNodeModal()

  addNotification(`New node "${name}" added successfully`)

  saveStateToLocalStorage()
}

function addNotification(message) {
  const timestamp = new Date().toLocaleString()
  const notification = {
    id: Date.now(),
    message,
    timestamp,
  }

  state.notifications.unshift(notification)

  renderNotifications()

  saveStateToLocalStorage()
}

function clearNotification(notificationId) {
  state.notifications = state.notifications.filter((n) => n.id !== notificationId)
  renderNotifications()
  saveStateToLocalStorage()
}

function clearAllNotifications() {
  if (confirm("Are you sure you want to clear all notifications?")) {
    state.notifications = []
    renderNotifications()
    saveStateToLocalStorage()
  }
}

function renderNotifications() {
  const container = document.getElementById("notifications-container")

  if (state.notifications.length === 0) {
    container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-bell-slash text-gray-400 text-3xl"></i>
                </div>
                <p class="text-gray-500 font-medium">No notifications yet</p>
                <p class="text-sm text-gray-400 mt-1">System alerts will appear here</p>
            </div>
        `
  } else {
    container.innerHTML = state.notifications
      .map(
        (notification) => `
            <div class="notification-card bg-white border-l-4 border-sky-500 p-4 rounded-r-lg shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3">
                <div class="flex-1">
                    <p class="text-gray-800 font-medium text-sm">${notification.message}</p>
                    <p class="text-xs text-gray-500 mt-1">
                        <i class="fas fa-clock mr-1"></i>
                        ${notification.timestamp}
                    </p>
                </div>
                <button 
                    onclick="clearNotification(${notification.id})"
                    class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Clear notification"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `,
      )
      .join("")
  }
}

function updateTyphoonStatusCard() {
  if (!state.typhoonSimulation.active) {
    document.getElementById("typhoon-status-card").classList.add("hidden")
    document.getElementById("dashboard-typhoon-status-card").classList.add("hidden")
    return
  }

  const elapsed = Date.now() - state.typhoonSimulation.startTime
  const progress = Math.min((elapsed / state.typhoonSimulation.totalDuration) * 100, 100)

  const cards = [
    {
      card: "typhoon-status-card",
      scenario: "typhoon-scenario-name",
      intensity: "typhoon-intensity-level",
      duration: "typhoon-duration-time",
      progress: "typhoon-progress-bar",
    },
    {
      card: "dashboard-typhoon-status-card",
      scenario: "dashboard-typhoon-scenario-name",
      intensity: "dashboard-typhoon-intensity-level",
      duration: "dashboard-typhoon-duration-time",
      progress: "dashboard-typhoon-progress-bar",
    },
  ]

  cards.forEach(({ card, scenario, intensity, duration, progress: progressBar }) => {
    document.getElementById(card).classList.remove("hidden")
    document.getElementById(scenario).textContent = state.typhoonSimulation.scenario.name
    document.getElementById(intensity).textContent = state.typhoonSimulation.intensity
    document.getElementById(duration).textContent = `${Math.round(state.typhoonSimulation.totalDuration / 1000)}s`
    document.getElementById(progressBar).style.width = `${progress}%`
  })
}

function updateLoginState() {
  const logoutButton = document.getElementById("logout-button-text")
  const dashboardAddNodeBtn = document.getElementById("dashboard-add-node-btn")
  const simulationTab = document.getElementById("content-simulation")

  if (state.isAuthenticated) {
    logoutButton.textContent = "Log Out"
    if (dashboardAddNodeBtn) dashboardAddNodeBtn.style.display = "flex"
    if (simulationTab) simulationTab.classList.remove("guest-mode")
  } else {
    logoutButton.textContent = "Log In"
    if (dashboardAddNodeBtn) dashboardAddNodeBtn.style.display = "none"
    if (simulationTab) simulationTab.classList.add("guest-mode")
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadStateFromLocalStorage()
  initMap()
  renderSimulationTable()
  renderNotifications()
  updateClock()

  setInterval(updateClock, 1000)

  startDataSimulation()
})
