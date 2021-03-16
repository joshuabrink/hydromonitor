const io = require('socket.io')(3003, {
  cors: {
    origin: 'http://localhost:8082',
    methods: ['GET', 'POST']
  }
})

// const socket = io

const { Logs } = require('./mongoUtil')
const { port, parser } = require('./arduinoUtil')

let prevDate = new Date(); let visible; let tickCount = 10
// const receivedData = []

const interval = 600000 // 10 minutes

// Logger
const pino = require('pino')
// const expressPino = require('express-pino-logger')

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

const waterData = { key: 'tempWater', data: [] }
const phData = { key: 'phLevel', data: [] }
const ppmData = { key: 'ppmLevel', data: [] }
const ecData = { key: 'ecLevel', data: [] }
const airData = { key: 'tempAir', data: [] }
const lightData = { key: 'lightLevel', data: [] }

const dataObjs = [
  waterData,
  phData,
  ppmData,
  ecData,
  airData,
  lightData
]

// Helper Functions

function isJson (item) {
  item = typeof item !== 'string'
    ? JSON.stringify(item)
    : item

  try {
    item = JSON.parse(item)
  } catch (e) {
    return false
  }

  if (typeof item === 'object' && item !== null) {
    return true
  }

  return false
}

function intervalBackup (date, data) {
  // 1 second = 1000

  if (date.getTime() - prevDate.getTime() >= interval) {
    // sendData(data)

    // console.log("Previous date: " + prevDate )
    // console.log("Current date: " + date)
    data.date = date
    // sendData(data)

    Logs.addlog(data).then(data => {
      logger.info('Data backed up: ' + data.date)
    })

    prevDate = date
    // postMessage({ prevDate: prevDate })
    // localStorage.setItem('prevDate', prevDate)
  }
}

// Row format [{key:value, ...}] to objects [{key:key, data: [values]}]
function dataSplitter (data, objects, date) {
  // count++
  delete data._id
  const keys = Object.keys(data)

  if (data.date) {
    date = data.date
  }

  keys.forEach(key => {
    const obj = objects.find(obj => { return obj.key === key })
    if (obj) {
      const xyParse = { x: date, y: data[key] }
      obj.data.push(xyParse)

      if (obj.data.length > tickCount) {
        obj.data = obj.data.slice(obj.data.length - tickCount, obj.data.length + 1)
        // obj.data.shift()
      }
    }
  })
}

// function dataSplitter (data, date) {
//   // count++

//   const objects = []
//   delete data._id
//   const keys = Object.keys(data)

//   if (data.date) {
//     date = data.date
//   }

//   keys.forEach(key => {
//     const obj = objects.find(obj => { return obj.key === key })
//     if (obj) {
//       const xyParse = { x: date, y: data[key] }
//       obj.data.push(xyParse)
//       if (obj.data.length > tickCount) {
//         obj.data = obj.data.slice(obj.data.length - tickCount, obj.data.length + 1)
//         // obj.data.shift()
//       }
//     } else {
//       objects.push({ key: key, data: [] })
//     }
//   })
//   return objects
// }

// Connection Handling

const socket = io.on('connection', (socket) => {
  logger.info('socket connected to by client')

  socket.on('filterLogs', (data) => {
    Logs.findlogs({
      date: {
        $gt: new Date(data.start),
        $lt: new Date(data.end)
      }
    }).then(logs => {
      io.sockets.emit('logs', logs)
    })
  })

  socket.on('tickRate', data => {
    port.write(data + '')
  })

  socket.on('tickCount', data => {
    tickCount = data
  })

  socket.on('visible', data => {
    visible = data
    if (visible) {
      socket.emit('chartData', dataObjs)
    }
  })

  return socket
})

parser.on('data', data => {
  if (!isJson(data)) return
  logger.info('got word from arduino: ' + data)

  const parsedData = JSON.parse(data)
  const date = new Date()

  // receivedData.push(parsedData)

  // postMessage(parsedData)
  dataSplitter(parsedData, dataObjs, date)

  intervalBackup(date, parsedData)

  // If tabbed in update charts with new data once
  if (visible) {
    socket.emit('chartData', dataObjs)
  }

  // console.log('got word from arduino:', data)
})
