/**
 * 将所有私信同步至mongo，初始化
 */
const getCookie = require('../model/user').getCookie
const get163Msgs = require('./get163Msgs')
const msgDb = require('../model/msgData')

const polling = (postData, userData, onnext) =>
  get163Msgs(postData, userData).then(async resData => {
    if (!resData.msgs) {
      return Promise.reject()
    }
    await onnext(resData)
    if (resData.more) {
      // resolve()
      postData.time = resData.msgs.slice(-1)[0].time
      return polling(postData, userData, onnext)
    } else {
      console.log('no more')
      return Promise.resolve()
    }
  }, () => Promise.reject())

module.exports.syncMsg = (postData, userData) => {
  const pollPostData = {
    limit: 100,
    time: -1,
    userId: postData.userId
  }
  return msgDb.open().then((db) => {
    console.log('db opened')
    return polling(pollPostData, userData, (msgData) => {
      return msgDb.fillDialog(db, userData.neteaseUid, pollPostData.userId, msgData.msgs)
    }).then(() => {
      console.log('polling finished')
      msgDb.close(db)
    })
  }, err => {
    console.log('db not open')
    console.log(err)
  })
}

module.exports.sync = async (ctx, next) => {
  if ('POST' !== ctx.method || !/sync/.test(ctx.url)) {
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

    await module.exports.syncMsg(postData, userData)

    ctx.body = {
      code: 0,
      data: 'sync finished',
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