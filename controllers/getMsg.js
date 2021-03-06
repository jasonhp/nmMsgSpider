/**
 * 获取消息内容，
 * 有翻页功能
 */
const getCookie = require('../model/user').getCookie
const get163Msgs = require('./get163Msgs')

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