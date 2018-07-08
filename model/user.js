const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  uid: String,
  csrf: String,
  MUSIC_U: String,
  neteaseUid: String,
})
const User = mongoose.model('User', userSchema)

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
  writeCookie: (userData) => {
    console.log('writing cookie')
    console.log(userData)
    return new Promise((resolve, reject) => {
      return connectMongo().then((db) => {
        console.log('mongo opened')
        if (userData.uid) {
          const writeData = {}
          if (userData.__csrf) {
            writeData.csrf = userData.__csrf
          }
          if (userData.MUSIC_U) {
            writeData.MUSIC_U = userData.MUSIC_U
          }
          if (userData.neteaseUid) {
            writeData.neteaseUid = userData.neteaseUid
          }
          console.log(writeData)
          User.updateOne({ _id: userData.uid }, {$set: writeData}, (err, res) => {
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