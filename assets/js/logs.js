
socket.emit('tickRate', '600')

let currLogs = []
let trueDateLogs = []
let tableView = true
let chartView = false

socket.on('logs', (logs) => {
  logs.forEach(log => {
    log.date = new Date(log.date)
  })
  currLogs = logs
  trueDateLogs = [...logs]

  if (tableView) {
    loadLogs(logs)
  }
  if (chartView) {
    loadCharts(logs)
  }
})

function sortListen (logs) {
  d3.selectAll('.log-headers .header .asc').on('click', (e) => {
    const key = e.target.parentElement.dataset.key
    currLogs.sort((a, b) => {
      return b[key] - a[key]
    })
    loadLogs(currLogs)
  })
  d3.selectAll('.log-headers .header .dec').on('click', (e) => {
    const key = e.target.parentElement.dataset.key
    currLogs.sort((a, b) => {
      return a[key] - b[key]
    })
    loadLogs(currLogs)
  })
}
sortListen()
// d3.selectAll('.log-headers .header').on('mouseout', (e) => {
//   d3.select(e.target).select('.asc').transition().duration(200).style('top', '13px')
//   d3.select(e.target).select('.dec').transition().duration(200).style('bottom', '13px')
// })
// function getToday (timeStamp) {
//   timeStamp -= timeStamp % (24 * 60 * 60 * 1000)
//   timeStamp = (new Date(timeStamp).getTimezoneOffset() * 60 * 1000)
//   return new Date(timeStamp)
// }

function getNextDay (timeStamp) {
  timeStamp += 24 * 60 * 60 * 1000
  // timeStamp -= timeStamp % (24 * 60 * 60 * 1000);
  // timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
  return new Date(timeStamp)
}

function getTimeISO (dateObj) {
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes() < 10 ? '0' + dateObj.getMinutes() : dateObj.getMinutes()
  const seconds = dateObj.getSeconds() < 10 ? '0' + dateObj.getSeconds() : dateObj.getSeconds()
  const time = hours + ':' + minutes + ':' + seconds
  return time
}

function getLogs (date) {
  const dateObj = {
    start: date,
    end: getNextDay(date.getTime())
  }
  socket.emit('filterLogs', dateObj)
}

const logContainer = document.querySelector('.log')

function loadLogs (logs) {
  chartView = false
  tableView = true
  let logBody = document.querySelector('.log-body')

  if (!logBody) {
    logContainer.innerHTML = `<div class="log-headers row w-100">
    <div class="row header" data-key="date">
      <p>Time</p>
      <img class="asc" src="/img/up.svg" alt="Sort Ascending">
      <img class="dec" src="/img/down.svg" alt="Sort Decsending">
    </div>

    <div class="row header" data-key="phLevel">
      <p>pH</p>
      <img class="asc" src="/img/up.svg" alt="Sort Ascending">
      <img class="dec" src="/img/down.svg" alt="Sort Decsending">
    </div>

    <div class="row header" data-key="ppmLevel">
      <p>PPM</p>
      <img class="asc" src="/img/up.svg" alt="Sort Ascending">
      <img class="dec" src="/img/down.svg" alt="Sort Decsending">
    </div>

    <div class="row header" data-key="ecLevel">
      <p>EC</p>
      <img class="asc" src="/img/up.svg" alt="Sort Ascending">
      <img class="dec" src="/img/down.svg" alt="Sort Decsending">
    </div>

    <div class="row header" data-key="tempWater">
      <p>Water</p>
      <img class="asc" src="/img/up.svg" alt="Sort Ascending">
      <img class="dec" src="/img/down.svg" alt="Sort Decsending">
    </div>

    <div class="row header" data-key="tempAir">
      <p>Air</p>
      <img class="asc" src="/img/up.svg" alt="Sort Ascending">
      <img class="dec" src="/img/down.svg" alt="Sort Decsending">
    </div>

    <div class="row header" data-key="lightLevel">
      <p>Light</p>
      <img class="asc" src="/img/up.svg" alt="Sort Ascending">
      <img class="dec" src="/img/down.svg" alt="Sort Decsending">
    </div>

  </div>
  <div class="log-body col w-100">`
    sortListen()
    logBody = document.querySelector('.log-body')
  }

  logBody.innerHTML = ''
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    logBody.innerHTML += `<div class="row around w-100">
    <p>${getTimeISO(log.date)} </p>
    <p>${log.phLevel} </p>
    <p>${log.ppmLevel} </p>
    <p>${log.ecLevel} </p>
    <p>${log.tempWater} </p>
    <p>${log.tempAir} </p>
    <p>${log.lightLevel} </p>
    </div>`
  }
  logBody.innerHTML += '</div>'
}

// function chartUpdater(dataObjs, charts) {

//   dataObjs.forEach(obj=> {
//     const currChart = charts.filter(chart=> chart.getKey()===obj.key)[0]
//     currChart.data = obj.data
//     currChart.update()
//   })

// }

function dataSplitter (data, charts, tickCount) {
  // count++
  const keys = Object.keys(data)
  delete data._id

  // const currChart = charts.filter(chart=> chart.getKey()===obj.key)[0]

  keys.forEach(key => {
    charts.forEach(chart => {
      if (key === chart.getKey()) {
        const xyParse = { x: new Date(data.date), y: data[key] }
        chart.data.push(xyParse)

        if (chart.data.length > tickCount) {
          chart.data = chart.data.slice(chart.data.length - tickCount, chart.data.length + 1)
          // obj.data.shift()
        }
      }
    })
  })
}

function loadCharts (logs) {
  chartView = true
  tableView = false
  logContainer.innerHTML = ''
  const phChart = new LineChartD3('pH Level', 'phLevel', '.log', 350, 300, '%H:%M', { min: 7, max: 9 })
  const ppmChart = new LineChartD3('PPM Level', 'ppmLevel', '.log', 350, 300, '%H:%M', { min: 0, max: 200 })
  const waterChart = new LineChartD3('Water Temperature', 'tempWater', '.log', 350, 300, '%H:%M', { min: 19, max: 29 })
  const ecChart = new LineChartD3('EC Level', 'ecLevel', '.log', 350, 300, '%H:%M', { min: 0, max: 0.295 })
  const airChart = new LineChartD3('Air Temperature', 'tempAir', '.log', 350, 300, '%H:%M', { min: 22, max: 33 })
  const lightChart = new LineChartD3('Light Level', 'lightLevel', '.log', 350, 300, '%H:%M')

  const charts = [
    airChart,
    waterChart,
    phChart,
    ppmChart,
    ecChart,
    lightChart
  ]

  // dataUpdater(logs, charts)
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    dataSplitter(log, charts, logs.length)
  }
  for (let c = 0; c < charts.length; c++) {
    const chart = charts[c]
    chart.update()
  }

  // chartUpdater(dataObjs, charts)
}

// const chartView = document.querySelector('.chart-view')
// const tableView = document.querySelector('.table-view')

const viewBtns = document.querySelectorAll('.views button')
const table = document.getElementById('table')

viewBtns.forEach(btn => {
  btn.addEventListener('click', e => {
    if (e.target.classList.contains('chart-view')) {
      loadCharts(trueDateLogs)
    }
    if (e.target.classList.contains('table-view')) {
      loadLogs(currLogs)
    }
  })
})

// Pasta

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'Setember',
  'October',
  'November',
  'December'
]

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const now = new Date()

let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

function getCurrentDate (element, asString) {
  if (element) {
    if (asString) {
      return element.textContent = weekdays[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear()
    }
    return element.value = date.toISOString().substr(0, 10)
  }
  return date
}

function generateCalendar () {
  const calendar = document.getElementById('calendar')
  if (calendar) {
    calendar.remove()
  }

  const table = document.createElement('table')
  table.id = 'calendar'

  const trHeader = document.createElement('tr')
  trHeader.className = 'weekends'
  weekdays.map(week => {
    const th = document.createElement('th')
    const w = document.createTextNode(week.substring(0, 3))
    th.appendChild(w)
    trHeader.appendChild(th)
  })

  table.appendChild(trHeader)

  const weekDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).getDay()

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate()

  let tr = document.createElement('tr')
  let td = ''
  let empty = ''
  let btn = document.createElement('button')
  let week = 0

  while (week < weekDay) {
    td = document.createElement('td')
    empty = document.createTextNode(' ')
    td.appendChild(empty)
    tr.appendChild(td)
    week++
  }

  for (let i = 1; i <= lastDay;) {
    while (week < 7) {
      td = document.createElement('td')
      let text = document.createTextNode(i)
      btn = document.createElement('button')
      btn.className = 'btn-day'
      btn.addEventListener('click', function () { changeDate(this) })
      week++

      if (i <= lastDay) {
        i++
        btn.appendChild(text)
        td.appendChild(btn)
      } else {
        text = document.createTextNode(' ')
        td.appendChild(text)
      }
      tr.appendChild(td)
    }

    table.appendChild(tr)

    tr = document.createElement('tr')

    week = 0
  }

  const content = document.getElementById('table')
  content.appendChild(table)
  changeActive()
  changeHeader(date)

  // Get Full day logs
  getLogs(date)

  // document.getElementById('date').textContent = date;
  getCurrentDate(document.getElementById('currentDate'), true)
  // getCurrentDate(document.getElementById("date"), false);
}

function setDate (form) {
  const newDate = new Date(form.date.value)
  date = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1)
  generateCalendar()
  return false
}

function changeHeader (dateHeader) {
  const month = document.getElementById('month-header')
  if (month.childNodes[0]) {
    month.removeChild(month.childNodes[0])
  }
  const headerMonth = document.createElement('h1')
  const textMonth = document.createTextNode(months[dateHeader.getMonth()].substring(0, 3) + ' ' + dateHeader.getFullYear())
  headerMonth.appendChild(textMonth)
  month.appendChild(headerMonth)
}

function changeActive () {
  let btnList = document.querySelectorAll('button.active')
  btnList.forEach(btn => {
    btn.classList.remove('active')
  })
  btnList = document.getElementsByClassName('btn-day')
  for (let i = 0; i < btnList.length; i++) {
    const btn = btnList[i]
    if (btn.textContent === (date.getDate()).toString()) {
      btn.classList.add('active')
    }
  }
}

function resetDate () {
  date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  generateCalendar()
}

function changeDate (button) {
  const newDay = parseInt(button.textContent)
  date = new Date(date.getFullYear(), date.getMonth(), newDay)
  generateCalendar()
}

function nextMonth () {
  date = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  generateCalendar(date)
}

function prevMonth () {
  date = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  generateCalendar(date)
}

function prevDay () {
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
  generateCalendar()
}

function nextDay () {
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  generateCalendar()
}

document.onload = generateCalendar(date)

// \Pasta
