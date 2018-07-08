/**
 * 网易云音乐登录模块
 * 手机号
 * 微博
 * 微信
 *
 * 关键cookie：__csrf, MUSIC_U  http://music.163.com/back/weibo?state=tqwaGiODkz&code=28a24ab3516b6c59bcccb27f40ff013b
 * 
 */
const request = require('request-promise-native')
const writeCookie = require('../model/user').writeCookie

module.exports = async (ctx, next) => {
  if ('POST' !== ctx.method || !/login/.test(ctx.url)) {
    ctx.body = {
      code: -1,
      msg: '发生错误'
    }
    await next()
    return false
  }
  // ctx.req.addListener('end', async () => {
  const postData = ctx.request.body
  if (postData.__csrf === undefined) {
    ctx.body = {
      code: -2,
      msg: '参数不合法'
    }
    await next()
    return false
  }
  let newUserid
  ctx.session.csrf = postData.__csrf
  ctx.session.MUSIC_U = postData.MUSIC_U
  try {
    newUserid = await writeCookie(postData)
    const resData = { code: 0, data: {} }
    if (newUserid) {
      ctx.cookies.set('uid', newUserid)
    }
    ctx.body = resData
  } catch(err) {
    console.log(err)
    ctx.body = {
      code: -1,
      msg: '系统错误',
    }
  }
  await next()
  // })
  if (newUserid) {
    let neteaseUid
    try {
      neteaseUid = await request({
        url: 'http://music.163.com/',
        method: 'get',
        jar: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Cookie': `__csrf=${postData.__csrf}; MUSIC_U=${postData.MUSIC_U};`,
        }
      }).then((htmlString) => {
        return htmlString.match(/GUser\s?=\s?{\s?userId:\s?(\d+?),/)[1]
      })
      if (neteaseUid.length > 0) {
        ctx.session.neteaseUid = postData.neteaseUid
        console.log(ctx.session)
        writeCookie({
          uid: newUserid,
          neteaseUid: neteaseUid
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
}