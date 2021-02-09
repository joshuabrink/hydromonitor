(async () => {
  // const https = require('https')
  const express = require('express')

  const app = express()
  // const fs = require('fs')
  const mongo = require('./lib/mongoUtil')
  const session = require('express-session')
  const cookieParser = require('cookie-parser')
  const flash = require('connect-flash')
  const path = require('path')
  const io = require('socket.io')(3003, {
    cors: {
      origin: "http://localhost:8082",
      methods: ["GET", "POST"]
    }
  });
  const SerialPort = require('serialport');
  const Readline = require('@serialport/parser-readline');
  const port = new SerialPort('/COM9', { baudRate: 9600 });
  const parser = port.pipe(new Readline({ delimiter: '\n' }));

  port.on("open", (err) => {
    if (err) {
      return console.log("Error: " + err)
    }
    console.log('serial port open');
  });

  parser.on('data', data => {

    io.sockets.emit('readings', { value: data });
    console.log('got word from arduino:', data);
  });

  io.on('connection', (socket) => {

    console.log('socket connected to by client')

    socket.on('stopReading', function (data) {
      port.close((err) => {
        if (err)
          console.log(err);
      })
    });
  })


  // Logger
  const pino = require('pino')
  // const expressPino = require('express-pino-logger')

  const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
  // logger.info('hi')
  // const expressLogger = expressPino({ logger })
  // app.use(expressLogger)

  // Databse initialization
  await mongo.init()


  // Express Cookie
  // app.use(cookieParser('secretString'))
  // app.set('trust proxy', 1) // trust first proxy
  // // Express session
  // app.use(
  //   session({
  //     name: 'sessionID',
  //     secret: process.env.SECRET,
  //     resave: true,
  //     saveUninitialized: true
  //   })
  // )

  // Flash
  // app.use(flash())

  // app.use(function (req, res, next) {
  //   res.locals.success_messages = req.flash('success_messages')
  //   res.locals.error_messages = req.flash('error_messages')
  //   next()
  // })

  app.use(express.static(path.join(__dirname, 'assets')))

  // EJS View Engine
  app.set('view engine', 'ejs')


  app.use(function (err, req, res, next) {
    logger.debug(err)
    return res.status(err.statusCode).json({ message: err.message, stack: err.stack })
  })

  app.get('/', (req, res) => {
    res.render('chart')
  })

  // 404 Page

  app.get('*', (req, res) => {
    res.render('404', { title: '404' })
  })

  app.listen(8082)


})()
