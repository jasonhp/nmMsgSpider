/**
 * 登出
 */

module.exports = async (ctx, next) => {
  if ('GET' !== ctx.method || !/logout/.test(ctx.url)) {
    ctx.body = {
      code: -1,
      msg: '系统错误'
    }
    await next()
    return false
  }
  console.log(ctx.cookies.get('uid'))
  if (ctx.cookies.get('uid') === undefined || ctx.cookies.get('uid').length === 0) {
    ctx.body = {
      code: -3,
      msg: '未登录'
    }
    return false
  }
  ctx.session.neteaseUid = ''
  ctx.session.csrf = ''
  ctx.session.MUSIC_U = ''
  ctx.cookies.set('uid', '', { maxAge: 0, signed: true })
  ctx.body = {
    code: 0
  }
  await next()
}