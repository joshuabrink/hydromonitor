// Avoid `console` errors in browsers that lack a console.
(function () {
  let method
  const noop = function () {}
  const methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ]
  let length = methods.length
  const console = (window.console = window.console || {})

  while (length--) {
    method = methods[length]

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop
    }
  }
}())

// Socket io creation

const socket = io('http://localhost:3003')

// Webworker creation

// let w

// if (typeof (Worker) !== 'undefined') {
//   if (typeof (w) === 'undefined') {
//     w = new Worker('/js/webworker.js')
//     w.onmessage = function (message) {
//       if (typeof message.data.prevDate !== 'undefined') {
//         localStorage.setItem('prevDate', message.data.prevDate)
//       }
//     }
//   }
// } else {
//   document.getElementById('result').innerHTML = 'Sorry! No Web Worker support.'
// }

// Get time across page loads

let prevDate
if (!localStorage.getItem('prevDate')) {
  prevDate = new Date()
  localStorage.setItem('prevDate', prevDate)
} else {
  prevDate = new Date(localStorage.getItem('prevDate'))
}
socket.emit('prevDate', prevDate)
// w.postMessage({ prevDate: prevDate })
