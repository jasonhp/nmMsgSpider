/**
 * 获取消息内容，
 * 有翻页功能
 */
const request = require('request-promise-native')
const getCookie = require('../model/user').getCookie
const postDataGen = require('./netease-req/postDataGenerator')

const get163Msgs = (postData, userData) => {
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

module.exports = async (ctx, next) => {
  if ('POST' !== ctx.method || !/msgs/.test(ctx.url)) {
    ctx.body = {
      code: -1,
      msg: '系统错误'
    }
    await next()
    return false
  }
  const postData = ctx.request.body
  if (!postData.userId) {
    ctx.body = {
      code: -1,
      msg: '参数错误'
    }
    await next()
    return false
  }
  if (ctx.cookies.get('uid') === undefined || ctx.cookies.get('uid').length === 0) {
    ctx.body = {
      code: -3,
      msg: '未登录'
    }
    return false
  }
  let userData, resData
  try {
    if (ctx.session.csrf) {
      userData = {
        neteaseUid: ctx.session.neteaseUid,
        csrf: ctx.session.csrf,
        MUSIC_U: ctx.session.MUSIC_U
      }
    } else {
      userData = await getCookie(ctx.cookies.get('uid'))
      ctx.session.neteaseUid = userData.neteaseUid
      ctx.session.csrf = userData.csrf
      ctx.session.MUSIC_U = userData.MUSIC_U
    }
    resData = await get163Msgs(postData, userData)
    ctx.body = {
      code: 0,
      data: resData,
    }
    await next()
  } catch (err) {
    console.log(err)
    if (err.code === 301) {
      ctx.body = {
        code: -3,
        msg: '网易云未登录',
      }
    } else {
      ctx.body = {
        code: -1,
        userList: '系统错误',
      }
    }
    await next()
  }

}