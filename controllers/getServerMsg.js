/**
 * 获取消息
 */
const getCookie = require('../model/user').getCookie
const msgDb = require('../model/msgData')
const syncMsg = require('./syncMsg').syncMsg

module.exports = async (ctx, next) => {
  if ('POST' !== ctx.method || !/serverMsg/.test(ctx.url)) {
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
  let userData
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

    let msgData = await msgDb.getMsg({
      selfId: userData.neteaseUid,
      userId: postData.userId,
      limit: postData.limit || 20,
      offset: postData.offset || 0,
    })

    if (msgData.msg.length === 0) {
      await syncMsg(postData, userData)
      msgData = await msgDb.getMsg({
        selfId: userData.neteaseUid,
        userId: postData.userId,
        limit: postData.limit || 20,
        offset: postData.offset || 0,
      })
    }

    ctx.body = {
      code: 0,
      data: msgData,
    }
    await next()

  } catch (err) {
    console.log(err)
    ctx.body = {
      code: -1,
      userList: '系统错误',
    }
    await next()
  }
}