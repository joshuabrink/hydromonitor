const ObjectID = require('mongodb').ObjectID
// const imageDecode = require('../lib/imageUpload');

class log {
  constructor (db) {
    this.collection = db.collection('logs')

    // this.collection.createIndex({
    //   title: 'text',
    //   location: 'text',
    //   material: 'text'
    // })
  }

  async addlog (log) {
    return await this.collection.insertOne(log).then((log, err) => {
      if (err) return err
      return log.ops[0]
    })
  }

  async updatelog (id, update) {
    if (!ObjectID.isValid(id)) return new Error('Incorrect ID type')
    const objId = new ObjectID(id)
    return await this.collection.findOneAndUpdate({ _id: objId }, update).then((uplog, err) => {
      if (err) return err
      return uplog.value
    })
  }

  async findlog (log) {
    return await this.collection.findOne(log).then((foundlog, err) => {
      if (err) return err
      return foundlog
    })
  }

  async findById (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOne({ _id: objId }).then((foundlog, err) => {
      if (err) return err
      return foundlog
    })
  }

  async findlogs (filter, limit = 0) {
    return await this.collection.find(filter).limit(limit).toArray().then((logs, err) => {
      if (err) return err
      return logs
    })
  }

  async deletelog (id) {
    const objId = new ObjectID(id)
    return await this.collection.findOneAndDelete({ _id: objId }).then((dellog, err) => {
      if (err) return err
      return dellog.value
    })
  }
}

module.exports = log
