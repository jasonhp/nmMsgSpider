const mongoose = require('mongoose')

// const msgSchema = mongoose.Schema()
const dialogSchema = mongoose.Schema({
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
const connectMongo = () => new Promise((resolve, reject) => {
  mongoose.connect(mongoURL)
  const db = mongoose.connection
  db.on('error', () => {
    console.error.bind(console, 'connection error:')
    reject()
  })
  db.once('open', resolve(db))
})


module.exports = {
  test: () => {
    connectMongo().then((db) => {
      console.log('mongo opened')
      db.close()
    })
  },
  fillDialog: (selfId, userId, msgs) => {
    console.log('newDialog')
    console.log(selfId)
    console.log(userId)
    return new Promise((resolve, reject) => {
      return connectMongo().then((db) => {
        console.log('mongo opened')
        let dialogId = ''
        if (Dialog[`${selfId}-${userId}`]) {
          dialogId = `${selfId}-${userId}`
        } else if (Dialog[`${userId}-${selfId}`]) {
          dialogId = `${userId}-${selfId}`
        }
        if (dialogId.length > 0) {
          Dialog.updateOne({ _id: dialogId }, {$push: msgs}, (err, res) => {
            if (err) {
              console.log('写入失败')
              db.close()
              reject()
            } else {
              console.log('写入成功')
              console.log(res)
              resolve()
            }
          })
        } else {
          // 创建一个用户
          const user = new User({
            csrf: userData.__csrf,
            MUSIC_U: userData.MUSIC_U
          })
          user.save((err, user) => {
            if (err) {
              console.log('创建用户失败')
              db.close()
              reject(err)
            } else {
              console.log('创建用户成功')
              console.log(user)
              db.close()
              resolve(user._id)
            }
          })
        }
      })
    })
  },
  getCookie: (uid) => new Promise((resolve, reject) => {
    return connectMongo().then((db) => {
      console.log('mongo opened')
      User.find({ _id: uid }, (err, data) => {
        if (err) {
          db.close()
          reject(err)
        } else {
          console.log(data)
          db.close()
          resolve({
            neteaseUid: data[0].neteaseUid,
            csrf: data[0].csrf,
            MUSIC_U: data[0].MUSIC_U
          })
        }
      })
    })
  })
}