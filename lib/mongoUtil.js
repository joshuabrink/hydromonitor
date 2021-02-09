const { MongoClient } = require('mongodb')
// const Groups = require('../models/Group');
// const Contacts = require('../models/Contact');
// const Messages = require('../models/Message');
const Log = require('./Log')

require('dotenv').config()

class MongoUtil {
  constructor () {
    const url = process.env.URL
    this.client = new MongoClient(url, { useUnifiedTopology: true })
  }

  async init () {
    return await this.client.connect().then((con, err) => {
      if (err) return err
      this.db = this.client.db(process.env.DB)
      this.Log = new Log(this.db)
      return con
    })

    // this.Contacts = new Contacts(this.db);
    // this.Groups = new Groups(this.db);
    // this.Messages = new Messages(this.db);
  }

  async isConnected () {
    return await this.client.isConnected()
  }

  async close () {
    await this.client.close()
  }

  async populateGroups () {
    this.Contacts.findDistinct('group').then(groups => {
      groups.forEach(group => {
        this.Contacts.findProjection({ group: [group] }, { number: 1 }).then(contacts => {
          this.Groups.addEntity({ name: group, contacts: contacts })
        })
      })
    })
  }

  async createIndex () {
    // Groups.collection.createIndex({"name": 1})
    // //CREATE MESSAGE INDEXES
    // // Messages.createIndex({"name": 1, "number": 1})
    // Messages.collection.createIndex({"contact.name": 1, "contact.number": 1})
    // Messages.collection.createIndex({message: "text"})

    // Contacts.collection.createIndex({name: "text", company:"text",email:"text"})

  }
}

module.exports = new MongoUtil()
