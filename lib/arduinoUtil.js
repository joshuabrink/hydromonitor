const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

// Logger
const pino = require('pino')
// const expressPino = require('express-pino-logger')

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

// Set Serial port
const port = new SerialPort('/COM10', { baudRate: 9600 }, (err) => {
  if (err) {
    // logger.error('Arduino not connected to COM10')
    logger.error(err)
  } else {
    logger.info('Arduino connected to COM10')
  }
})

port.on('open', (err) => {
  if (err) {
    logger.error('Error: ' + err)
  } else {
    logger.info('serial port open')
  }
})

port.on('close', () => {
  logger.info('serial port closed')
})

const parser = port.pipe(new Readline({ delimiter: '\n' }))

module.exports = { parser: parser, port: port }
