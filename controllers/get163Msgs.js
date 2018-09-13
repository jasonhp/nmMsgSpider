const request = require('request-promise-native')
const postDataGen = require('./netease-req/postDataGenerator')

module.exports = (postData, userData) => {
  let queryParams = {
    time: -1,
    total: true,
    userId: postData.userId
  }
  queryParams.offset = postData.offset || undefined
  queryParams.limit = postData.limit || 50
  queryParams = postDataGen(queryParams)
  const cookieStr = `__csrf=${userData.csrf}; MUSIC_U=${userData.MUSIC_U};`
  return request({
    url: `http://music.163.com/weapi/msg/private/history?csrf_token=${userData.csrf || ''}`,
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
        return {
          fromUser: {
            userId: msg.fromUser.userId,
            avatar: msg.fromUser.avatarUrl,
            nickname: msg.fromUser.nickname
          },
          id: msg.id,
          msg: msgData.type === 6 ? {
            type: msgData.type,
            content: msgData.msg,
          } : null,
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