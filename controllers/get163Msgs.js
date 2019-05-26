const request = require('request-promise-native')
const postDataGen = require('./netease-req/postDataGenerator')

module.exports = (postData, userData) => {
  let queryParams = {
    total: true,
    userId: postData.userId
  }
  queryParams.time = postData.time
  queryParams.offset = postData.offset || null
  queryParams.limit = postData.limit || 50
  queryParams.csrf_token = userData.csrf
  queryParams = postDataGen(queryParams)
  const cookieStr = `__csrf=${userData.csrf}; MUSIC_U=${userData.MUSIC_U};`
  return request({
    url: `https://music.163.com/weapi/msg/private/history?csrf_token=${userData.csrf || ''}`,
    method: 'post',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': cookieStr
    },
    form: queryParams
  }).then((res) => {
    const resData = JSON.parse(res)
    if (resData.code === 200) {
      const msgs = resData.msgs.map((msg) => {
        const msgData = JSON.parse(msg.msg)
        let msgObj = {
          type: msgData.type,
          content: msgData.msg,
        }
        switch (msgData.type) {
          case 16:
            // 图片
            msgObj.picUrl = msgData.picInfo.picUrl
            break
          case 1:
            // 歌
            msgObj.song = msgData.song.name
            msgObj.artist = msgData.song.artists.reduce(
              (acc, cur, idx) =>
                `${acc}${(idx === 0 ? '' : '、')}${cur.name}`,
              ''
            )
            if (msgData.song.artists.length > 1) {
              console.log(msgObj.artist)
            }
            break
          case 7:
            // mv
            msgObj.mvName = msgData.mv.name
            msgObj.mvArtist = msgData.mv.artist.name
            break
          case 5:
            // 电台
            msgObj.radioName = msgData.program.radio.name
            break
          case 2:
            // 专辑
            msgObj.albumName = msgData.album.name
            msgObj.albumArtist = msgData.album.artist.name
            break
          case 24:
            // 视频
            msgObj.videoName = msgData.video.title
            break
          case 15:
            // 评论
            msgObj.commentContent = msgData.comment.content
            msgObj.commentFrom = msgData.comment.resourceName
            break
          case 4:
            // 歌单
            msgObj.playlistName = msgData.playlist.name
            break
          case 6:
            break
          default:
            console.error('未知 type', msgData.type)
            console.error(msg)
        }
        return {
          fromUser: {
            userId: msg.fromUser.userId,
            avatar: msg.fromUser.avatarUrl,
            nickname: msg.fromUser.nickname,
          },
          id: msg.id,
          msg: msgObj,
          time: msg.time,
          toUser: {
            userId: msg.toUser.userId,
            avatar: msg.toUser.avatarUrl,
            nickname: msg.toUser.nickname
          }
        }
      })
      return {
        more: resData.more,
        msgs: msgs
      }
    } else {
      return Promise.reject(resData)
    }
  })
}