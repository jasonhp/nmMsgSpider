const mongoose = require('mongoose')

const dialogSchema = mongoose.Schema({
  _id: String,
  friendId: Number,
  msgList: [{
    id: Number,
    fromUser: {
      userId: Number,
      avatar: String,
      nickname: String,
    },
    toUser: {
      userId: Number,
      avatar: String,
      nickname: String,
    },
    msg: mongoose.Schema.Types.Mixed,
    time: Number,
  }],
})
const Dialog = mongoose.model('Dialog', dialogSchema)

const mongoURL = 'mongodb://localhost/neteaseMsg'
const connectMongo = (dbConnect) => new Promise((resolve, reject) => {
  if (dbConnect) {
    return resolve(dbConnect)
  }
  mongoose.connect(mongoURL)
  const db = mongoose.connection
  db.on('error', () => {
    console.error.bind(console, 'connection error:')
    reject()
  })
  db.once('open', resolve(db))
})

const checkDialog = (selfId, userId) => new Promise((resolve, reject) => {
  let dialogId = `${selfId}-${userId}`

  Dialog.find({ _id: dialogId }, (err, data) => {
    if (err || data.length === 0) {
      dialogId = `${userId}-${selfId}`
      Dialog.find({ _id: dialogId }, (err, data) => {
        if (err || data.length === 0) {
          reject(err)
        } else {
          resolve(dialogId)
        }
      })
    } else {
      resolve(dialogId)
    }
  })
})


module.exports = {
  test: () => {
    connectMongo().then((db) => {
      console.log('mongo opened')
      db.close()
    })
  },
  open: async () => new Promise((resolve, reject) => {
    mongoose.connect(mongoURL)
    const db = mongoose.connection
    db.on('error', () => {
      console.error.bind(console, 'connection error:')
      reject()
    })
    db.once('open', resolve(db))
  }),
  close: (db) => db.close(),
  fillDialog: (db, selfId, userId, msgs) => {
    return new Promise((resolve, reject) => {
      return connectMongo(db).then(() => {
        console.log('mongo opened')
        checkDialog(selfId, userId).then(dialogId => {
          Dialog.updateOne({ _id: dialogId }, {$push: { msgList: msgs }}, (err, res) => {
            if (err) {
              console.log('写入失败')
              reject()
            } else {
              console.log('写入成功')
              resolve()
            }
          })
        }, () => {
          // 创建一个对话
          const dialog = new Dialog({
            _id: `${selfId}-${userId}`,
            msgList: msgs,
          })
          dialog.save((err, dialog) => {
            if (err) {
              console.log('创建对话失败')
              reject(err)
            } else {
              console.log('创建对话成功')
              resolve(dialog._id)
            }
          })
        })
      })
    })
  },

  getMsg: ({ selfId, userId, offset, limit }) => new Promise((resolve, reject) => {
    return connectMongo().then(() => {
      console.log('get msg')
      checkDialog(selfId, userId).then(dialogId => {
        console.log(dialogId)
        Dialog
          .findOne(
            { _id: dialogId },
            {
              'msgList': {
                $slice: [parseInt(offset), parseInt(limit)]
              }
            },
            (err, result) => {
              if (err) {
                reject(err)
              }
              const resData = {}
              resData.msg = result.msgList
              resData.more = result.msgList.length === limit
              resolve(resData)
            },
          )

      }, err => {
        if (err === null) {
          resolve({
            msg: [],
            more: false,
          })
          return
        }
        console.log(err)
        reject(err)
      })
    })
  }),

  getAllMsg: ({ selfId, userId }) => new Promise((resolve, reject) => {
    return connectMongo().then(() => {
      console.log('get all msg')
      checkDialog(selfId, userId).then(dialogId => {
        console.log(dialogId)
        Dialog
          .findOne(
            { _id: dialogId },
            'msgList',
            (err, result) => {
              if (err) {
                reject(err)
              }
              const resData = {}
              resData.msg = result.msgList
              resolve(resData)
            },
          )
      }, err => {
        if (err === null) {
          resolve({
            msg: [],
          })
          return
        }
        console.log(err)
        reject(err)
      })
    })
  })
}