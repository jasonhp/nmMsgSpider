const fs = require('fs')
const moment = require('moment')
const request = require('sync-request')
const msgDb = require('./model/msgData')
const PDFDocument = require('pdfkit')

const doc = new PDFDocument({
  info: {
    Title: '我们的网易云聊天记录',
    Author: 'Jason',
  }
})
doc.pipe(fs.createWriteStream('./test.pdf'))

function switchFont(font) {
  if (font === 0) {
    return doc.font('./PingFang-SC-Light.ttf')
  }
  if (font === 1) {
    return doc.font('./PingFang-SC-Light.ttf')
  }
  return doc.font('./PingFang-SC-Regular.ttf')
}

switchFont(2)

msgDb.getAllMsg({
  selfId: 1262504,
  userId: 10429899,
}).then(result => {
  let lastTimestamp = Date.now()
  const msgLen = result.msg.length

  doc.fontSize(30).text(`${result.msg[0].toUser.nickname} 与 ${result.msg[0].fromUser.nickname} 的网易云聊天记录`, 100, 300, {
    align: 'center'
  }).fontSize(20).moveDown().text('--------- by Jason', {
    align: 'right'
  })

  for (let i = msgLen - 1; i >= 0; i --) {
    const msg = result.msg[i]

    const lastDate = new Date(lastTimestamp)
    const msgDate = new Date(msg.time)
    if (msgDate.getDate() !== lastDate.getDate() || msgDate.getMonth() !== lastDate.getMonth()) {
      doc
        .addPage()
        .fillColor('#ccc')
        .fontSize(14)
        .text(moment(msg.time).locale('zh-cn').format('ll'))
        .moveDown().moveDown()
      doc
        .moveDown()
        .fillColor('#ccc')
        .fontSize(14)
        .text(moment(msg.time).format('HH:mm'), {
          align: 'center'
        })
        .moveDown()
    } else {
      if (msg.time - lastTimestamp > 30 * 60 * 1000) {
        doc
          .moveDown()
          .fillColor('#ccc')
          .fontSize(14)
          .text(moment(msg.time).format('HH:mm'), {
            align: 'center'
          })
          .moveDown()
      }
    }

    if (i === msgLen - 1) {
      doc
        .moveDown()
        .fillColor('#ccc')
        .fontSize(16)
        .text('我们互关啦！', {
          align: 'center'
        })
        .moveDown()
        .moveDown()
        .moveDown()
        .moveDown()
    }

    lastTimestamp = msgDate.getTime()
    doc.fontSize(18).fillColor('#262626')
    const msgObj = msg.msg
    switchFont(0).text(`${msg.fromUser.nickname} `, { continued: true })
    switch (msgObj.type) {
      case 16: {
        // 图片
        doc.text('发了一张图↓')
        const pic = request('get', msgObj.picUrl)
        const picBase64 = new Buffer(pic.body).toString('base64')
        doc.image(`data:image/jpg;base64, ${picBase64}`, { width: 300 })
        break
      }
      case 1:
        // 歌
        doc.text(`分享了来自 ${msgObj.artist} 的作品`, {
          continued: true
        })
        switchFont(1).text(`《${msgObj.song}》`, {
          continued: msgObj.content.length > 0
        })
        break
      case 7:
        // mv
        doc.text(`分享了来自 ${msgObj.mvArtist} 的 MV`, {
          continued: true,
        })
        switchFont(1).text(`《${msgObj.mvName}》`, {
          continued: msgObj.content.length > 0
        })
        break
      case 5:
        // 电台
        doc.text('分享了电台', {
          continued: true,
        })
        switchFont(1).text(`《${msgObj.radioName}》`, {
          continued: msgObj.content.length > 0
        })
        break
      case 2:
        // 专辑
        doc.text(`分享了来自 ${msgObj.albumArtist} 的专辑`, {
          continued: true,
        })
        switchFont(1).text(`《${msgObj.albumName}》`, {
          continued: msgObj.content.length > 0
        })
        break
      case 24:
        // 视频
        doc.text('分享了视频', {
          continued: true,
        })
        switchFont(1).text(`《${msgObj.videoName}》`, {
          continued: msgObj.content.length > 0
        })
        break
      case 15:
        // 评论
        doc.text(`分享了 ${msgObj.commentFrom} 的一条评论：`)
        switchFont(2).fillColor('#ccc').fontSize(14).moveDown().text(`“${msgObj.commentContent}”`).moveDown()
        break
      case 4:
        // 歌单
        doc.text('分享了歌单：', {
          continued: true,
        })
        switchFont(1).text(`《${msgObj.playlistName}》`, {
          continued: msgObj.content.length > 0
        })
        break
      case 6:
        doc.text('：', { continued: true })
        switchFont(2).text(msgObj.content)
        break
      default:
        doc.text('发了一种我没处理的消息', {
          continued: true
        })
        console.error('未知 type', msgObj.type)
        console.error(msgObj)
        break
    }
    if (msgObj.type !== 6 && msgObj.content.length > 0) {
      doc.fontSize(18).fillColor('#262626')
      switchFont(0).text('，并且说：', {
        continued: true,
      })
      switchFont(2).text(msgObj.content)
    }
    doc.moveDown()
  }
  console.log('finished')
  doc.end()
})

