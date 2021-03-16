
(async () => {
  const express = require('express')
  const app = express()
  const mongo = require('./lib/mongoUtil')
  const path = require('path')

  app.use(express.static(path.join(__dirname, 'assets')))

  // EJS View Engine
  app.set('view engine', 'ejs')

  // Logger
  const pino = require('pino')
  // const expressPino = require('express-pino-logger')

  const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
  // logger.info('hi')
  // const expressLogger = expressPino({ logger })
  // app.use(expressLogger)

  // Databse initialization
  await mongo.init()
  const socketHandler = require('./lib/socketUtil')
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

  // app.use(function (err, req, res, next) {
  //   logger.debug(err)
  //   return res.status(err.statusCode).json({ message: err.message, stack: err.stack })
  // })

  app.get('/', (req, res) => {
    res.render('chart', { page: 'Charts' })
  })

  app.get('/logs', (req, res) => {
    res.render('logs', { page: 'Logs' })
  })

  // app.get('/data', (req,res)=> {
  //   let data = fs.readFileSync('./lib/data/data.csv').toString();
  //   res.send(data)
  // })

  // app.post('/data', (req,res)=> {
  //   let data = fs.readFileSync('./lib/data/data.csv').toString();
  //   res.send(data)
  // })

  // 404 Page

  app.get('*', (req, res) => {
    res.render('404', { title: '404' })
  })

  app.listen(8082)
})()
