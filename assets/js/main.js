if (!localStorage.getItem('tickRate')) localStorage.setItem('tickRate', '5')
if (!localStorage.getItem('tickCount')) localStorage.setItem('tickCount', '10')
const tickRate = localStorage.getItem('tickRate')
const tickCount = localStorage.getItem('tickCount')

d3.select('.tickRate .value').text(baseTenStr(localStorage.getItem('tickRate')))
socket.emit('tickRate', localStorage.getItem('tickRate'))
d3.select('.tickCount .value').text(baseTenStr(localStorage.getItem('tickCount')))
socket.emit('tickCount', localStorage.getItem('tickCount'))

function baseTenStr (val) {
  if (parseInt(val) < 10) {
    return '0' + val
  } else {
    return '' + val
  }
}

function displayInterval (time, count) {
  d3.select('.totalInterval').text((e) => {
    let secondCount = time * count
    let minuteCount = 0
    let hourCount = 0
    if (secondCount > 60) {
      minuteCount = parseInt(secondCount / 60)
      secondCount %= 60
    }
    if (minuteCount > 60) {
      hourCount = parseInt(minuteCount / 60)
      minuteCount %= 60
    }
    // if (hourCount < 10) hourCount = '0' + hourCount
    // if (minuteCount < 10) minuteCount = '0' + minuteCount
    // if (secondCount < 10) secondCount = '0' + secondCount
    hourCount = baseTenStr(hourCount)
    minuteCount = baseTenStr(minuteCount)
    secondCount = baseTenStr(secondCount)

    const formatedTime = hourCount + ':' + minuteCount + ':' + secondCount
    return formatedTime
  })
}
displayInterval(localStorage.getItem('tickRate'), localStorage.getItem('tickCount'))

// const socket = io('http://localhost:3003')
const rateSlider = d3
  .sliderHorizontal()
  .min(2)
  .max(60)
  .step(1)
  .width(300)
  .default(tickRate)
  .displayValue(false)
  .on('end', (val) => {
    d3.select('.tickRate .value').text(baseTenStr(val))
    if (localStorage.getItem('tickRate')) localStorage.setItem('tickRate', val)
    // w.postMessage({ tickRate: val })
    socket.emit('tickRate', val)
    displayInterval(val, localStorage.getItem('tickCount'))
  })

const countSlider = d3
  .sliderHorizontal()
  .min(5)
  .max(100)
  .step(5)
  .width(300)
  .default(tickCount)
  .displayValue(false)
  .on('end', (val) => {
    d3.select('.tickCount .value').text(baseTenStr(val))
    if (localStorage.getItem('tickCount')) localStorage.setItem('tickCount', val)
    socket.emit('tickCount', val)
    displayInterval(localStorage.getItem('tickRate'), val)
    // w.postMessage({ tickCount: val })
    // d3.select('#value').text(val);
    // socket.emit('tickChange', val)
  })

d3.select('.tickRate')
  .append('svg')
  .attr('width', 350)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(30,30)')
  .call(rateSlider)

d3.select('.tickCount')
  .append('svg')
  .attr('width', 350)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(30,30)')
  .call(countSlider)

const waterChart = new LineChartD3('Water Temperature', 'tempWater', '.charts', 350, 300, '%M:%S', { min: 19, max: 29 })
const phChart = new LineChartD3('pH Level', 'phLevel', '.charts', 350, 300, '%M:%S', { min: 7, max: 9 })
const ppmChart = new LineChartD3('PPM Level', 'ppmLevel', '.charts', 350, 300, '%M:%S', { min: 0, max: 200 })
const ecChart = new LineChartD3('EC Level', 'ecLevel', '.charts', 350, 300, '%M:%S', { min: 0, max: 0.295 })
const airChart = new LineChartD3('Air Temperature', 'tempAir', '.charts', 350, 300, '%M:%S', { min: 22, max: 33 })
const lightChart = new LineChartD3('Light Level', 'lightLevel', '.charts', 350, 300, '%M:%S')

const charts = [
  airChart,
  waterChart,
  phChart,
  ppmChart,
  ecChart,
  lightChart
]

// Set the name of the hidden property and the change event for visibility
let hidden, visibilityChange
if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
  hidden = 'hidden'
  visibilityChange = 'visibilitychange'
} else if (typeof document.msHidden !== 'undefined') {
  hidden = 'msHidden'
  visibilityChange = 'msvisibilitychange'
} else if (typeof document.webkitHidden !== 'undefined') {
  hidden = 'webkitHidden'
  visibilityChange = 'webkitvisibilitychange'
}
socket.emit('visible', true)
function handleVisibilityChange () {
  if (document[hidden]) {
    socket.emit('visible', false)
  } else {
    socket.emit('visible', true)
  }
}

document.addEventListener(visibilityChange, handleVisibilityChange, false)

function dataUpdater (dataObjs, charts) {
  dataObjs.forEach(obj => {
    const currChart = charts.filter(chart => chart.getKey() === obj.key)[0]
    obj.data = obj.data.map(data => { return { x: new Date(data.x), y: data.y } })
    currChart.data = obj.data

    currChart.update()
  })
}

socket.on('chartData', data => {
  dataUpdater(data, charts)
})
