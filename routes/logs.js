const {Logs} = require('../lib/mongoUtil')
const router = require('express').Router()


router.get('/data', async (req,res)=> {
  const {filter} = req.body
  const logsFound = Logs.findlogs({filter})

  if(addLog instanceof Error) res.send('Error:' + addLog)

  res.send(addLog)

})


router.post('/data', async (req,res)=> {
  const {log} = req.body
  const addLogs = await Logs.addlog(log)

  if(addLog instanceof Error) res.send('Error:' + addLog)

  res.send('Successfully backed-up data')
})

