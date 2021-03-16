
importScripts('/js/socket.io.js')
const socket = io('http://localhost:3003')

// function dataSplitter(data, charts, tickCount) {

//   // count++
//   const keys = Object.keys(data)

//   for (let i = 0; i < keys.length; i++) {
//     const key = keys[i];
//     for (let j = 0; j < charts.length; j++) {

//       if (charts[j].getKey() == key) {

//         let xyParse = { x: new Date(Date.now()), y: data[key] }
//         charts[j].addData(xyParse)
//         // charts[j].update()

//         while (charts[j].dataLength() > tickCount) {
//           charts[j].shiftData()
//         }

//       }

//     }
//   }

// }
function sendData (data) {
  socket.emit('logData', data)
  // fetch('/log', {
  //   method: 'POST',
  //   body: JSON.stringify(data),
  //   // headers: {
  //   //   'Content-Type':'application/json;charset=utf-8'
  //   // }
  // })
  // .then(response => response.json())
  // .then(data => { return data })
}

let prevDate

const interval = 600000 // 10 minutes

function intervalBackup (date, data) {
  // 1 second = 1000

  if (date.getTime() - prevDate.getTime() > interval) {
    // sendData(data)

    // console.log("Previous date: " + prevDate )
    // console.log("Current date: " + date)
    data.date = date
    sendData(data)

    prevDate = date
    postMessage({ prevDate: prevDate })
    // localStorage.setItem('prevDate', prevDate)
  }
}

function dataSplitter (data, objects, tickCount) {
  // count++
  const keys = Object.keys(data)
  const date = new Date()
  intervalBackup(date, data)

  keys.forEach(key => {
    objects.forEach(obj => {
      if (key === obj.key) {
        const xyParse = { x: date, y: data[key] }
        obj.data.push(xyParse)

        if (obj.data.length > tickCount) {
          obj.data = obj.data.slice(obj.data.length - tickCount, obj.data.length + 1)
          // obj.data.shift()
        }
      }
    })
  })
}

const waterData = { key: 'tempWater', data: [] }
const phData = { key: 'phLevel', data: [] }
const ppmData = { key: 'ppmLevel', data: [] }
const airData = { key: 'tempAir', data: [] }
const lightData = { key: 'lightLevel', data: [] }

const dataObjs = [
  waterData,
  phData,
  ppmData,
  airData,
  lightData
]

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

let tickCount = 10
let visible = true

onmessage = (message) => {
  if (typeof message.data.tickCount !== 'undefined') {
    tickCount = message.data.tickCount
  }
  if (typeof message.data.visible !== 'undefined') {
    visible = message.data.visible
  }
  if (typeof message.data.tickRate !== 'undefined') {
    socket.emit('tickChange', message.data.tickRate)
  }
  if (typeof message.data.prevDate !== 'undefined') {
    prevDate = message.data.prevDate
  }
}

socket.on('connect', () => {
  console.log('Connected')
})

socket.on('disconnect', (reason) => {
  console.log(reason)
})

const receivedData = []
socket.on('readings', function (data) {
  if (!isJson(data)) return

  const parsedData = JSON.parse(data)

  receivedData.push(parsedData)

  // postMessage(parsedData)
  dataSplitter(parsedData, dataObjs, tickCount)

  // If tabbed in update charts with new data once
  if (visible) {
    postMessage(dataObjs)
  }
})
