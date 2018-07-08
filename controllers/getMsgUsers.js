/**
 * 请求私信对象列表
 */
const request = require('request-promise-native')
const getCookie = require('../model/user').getCookie
const postDataGen = require('./netease-req/postDataGenerator')

const getUsers = (userData) => {
  const postData = postDataGen({
    uid: userData.neteaseUid,
    getcounts: true,
    offset: 0,
    total: true,
    limit: 50,
  })
  const cookieStr = `__csrf=${userData.csrf}; MUSIC_U=${userData.MUSIC_U};`
  return request({
    url: `http://music.163.com/weapi/msg/private/users?csrf_token=${userData.csrf || ''}`,
    method: 'post',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': cookieStr
    },
    form: postData
  }).then((res) => {
    const resData = JSON.parse(res)
    console.log(resData.code)
    if (resData.code === 200) {
      return  resData.msgs.map((msg) => {
        return {
          uid: msg.fromUser.userId,
          avatar: msg.fromUser.avatarUrl,
          nickname: msg.fromUser.nickname
        }
      })
    } else {
      return Promise.reject(resData)
    }
  })
}

module.exports = async (ctx, next) => {
  if ('GET' !== ctx.method || !/users/.test(ctx.url)) {
    ctx.body = {
      code: -1,
      msg: '系统错误'
    }
    await next()
    return false
  }
  let userData, resData
  console.log(ctx.cookies.get('uid'))
  if (ctx.cookies.get('uid') === undefined || ctx.cookies.get('uid').length === 0) {
    ctx.body = {
      code: -3,
      msg: '未登录'
    }
    return false
  }
  try {
    console.log(ctx.session)
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
    resData = await getUsers(userData)
    ctx.body = {
      code: 0,
      data: {
        userList: resData,
      }
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