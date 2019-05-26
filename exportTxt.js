const fs = require('fs')
const moment = require('moment')
const msgDb = require('./model/msgData')

const stream = fs.createWriteStream('网易云记录.txt', { flags: 'a' })

msgDb.getAllMsg({
  selfId: 1262504,
  userId: 10429899,
}).then(result => {
  stream.write(`\r\n\r\n\r\n\r\n${result.msg[0].toUser.nickname} 与 ${result.msg[0].fromUser.nickname} 的网易云聊天记录\r\n`)
  stream.write('--------- by Jason\r\n\r\n\r\n')
  let lastTimestamp = Date.now()
  let lastMsgDate = new Date()
  const msgLen = result.msg.length

  stream.write(moment(result.msg[msgLen - 1].time).locale('zh-cn').format('ll'))
  stream.write('\r\n\r\n\r\n')
  stream.write(moment(result.msg[msgLen - 1].time).format('HH:mm'))
  stream.write('\r\n\r\n')
  stream.write('我们互关啦！')
  stream.write('\r\n\r\n\r\n')

  for (let i = msgLen - 1; i >= 0; i --) {
    const msg = result.msg[i]
    const msgDate = new Date(msg.time)
    if (
        (msgDate.getDate() !== lastMsgDate.getDate() || msgDate.getMonth() !== lastMsgDate.getMonth()) &&
        msg.time - lastTimestamp > 1000 * 60 * 30
    ) {
      stream.write('\r\n\r\n\r\n')
      stream.write(moment(msg.time).locale('zh-cn').format('ll'))
      stream.write('\r\n\r\n\r\n')
      stream.write(moment(msg.time).format('HH:mm'))
      stream.write('\r\n\r\n')
      lastMsgDate = msgDate
    } else {
      if (msg.time - lastTimestamp > 30 * 60 * 1000) {
        stream.write('\r\n\r\n')
        stream.write(moment(msg.time).format('HH:mm'))
        stream.write('\r\n\r\n')
      }
    }

    lastTimestamp = msg.time
    const msgObj = msg.msg
    stream.write(`${msg.fromUser.nickname} `)
    switch (msgObj.type) {
      case 16: {
        // 图片
        stream.write('发了一张图\r\n')
        break
      }
      case 1:
        // 歌
        stream.write(`分享了来自 ${msgObj.artist} 的作品`)
        stream.write(`《${msgObj.song}》`)
        break
      case 7:
        // mv
        stream.write(`分享了来自 ${msgObj.mvArtist} 的 MV`)
        stream.write(`《${msgObj.mvName}》`)
        break
      case 5:
        // 电台
        stream.write('分享了电台')
        stream.write(`《${msgObj.radioName}》`)
        break
      case 2:
        // 专辑
        stream.write(`分享了来自 ${msgObj.albumArtist} 的专辑`)
        stream.write(`《${msgObj.albumName}》`)
        break
      case 24:
        // 视频
        stream.write('分享了视频')
        stream.write(`《${msgObj.videoName}》`)
        break
      case 15:
        // 评论
        stream.write(`分享了 ${msgObj.commentFrom} 的一条评论：`)
        stream.write(`“${msgObj.commentContent}”\r\n`)
        break
      case 4:
        // 歌单
        stream.write('分享了歌单：')
        stream.write(`《${msgObj.playlistName}》`)
        break
      case 6:
        stream.write('：')
        stream.write(msgObj.content)
        break
      default:
        stream.write('发了一种我没处理的消息')
        console.error('未知 type', msgObj.type)
        console.error(msgObj)
        break
    }
    if (msgObj.type !== 6 && msgObj.content.length > 0) {
      stream.write('，并且说：')
      stream.write(msgObj.content)
    }
    stream.write('\r\n')
  }
  console.log('finished')
  stream.end()
})

