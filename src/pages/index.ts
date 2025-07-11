// main script to ensure that the log file gets continiously updated
window.onload = () => {
  console.log('loaded')
  const logContentElement = document.getElementById('log-content')
  if (logContentElement != null) {
    logContentElement.innerText = `getting log from server`

    let lastFlattenedLog: string = ''
    let awaitingResponse = false
    const intervalId = setInterval(() => {
      if (!awaitingResponse) {
        awaitingResponse = true
        fetch('/log')
          .then((response) => response.json())
          .then((data) => {
            const newFlattenedLog = data.join('\n\r')
            if (newFlattenedLog !== lastFlattenedLog) {
              lastFlattenedLog = newFlattenedLog
              logContentElement.innerText = newFlattenedLog
            }
            awaitingResponse = false
          })
          .catch((error) => {
            // Handle request errors
            console.error('GET log:', error)
            logContentElement.innerText = `Error getting log, stopping refresh. Refresh the page to restart log tracking`
            clearInterval(intervalId)
          })
      }
    }, 500)
  }
}

// various api actions
function callPing() {
  activateServerFunction('ping')
}
function callClearLog() {
  activateServerFunction('clearLog')
}

function callGetUuids() {
  activateServerFunction('getUuids')
}
function callGetCountriesByFilter() {
  activateServerFunction('getCountriesByFilter')
}
function callCreateNewIMS() {
  activateServerFunction('createNewIMS')
}
function callUpdateIMS() {
  activateServerFunction('updateIMS')
}

// helpers
function activateServerFunction(endpoint: string) {
  fetch(`/${endpoint}`, {
    method: 'POST',
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(`${endpoint} response: `, data)
    })
    .catch((error) => {
      // Handle request errors
      console.error(`POST ${endpoint}:`, error)
    })
}
