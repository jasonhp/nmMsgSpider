// 111
const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const Router = require('koa-router')
const session = require('koa-session')
const router = new Router()
const login = require('./controllers/login')
const logout = require('./controllers/logout')
const getUsers = require('./controllers/getMsgUsers')
const getMsg = require('./controllers/getMsg')
const sync = require('./controllers/syncMsg').sync
const getServerMsg = require('./controllers/getServerMsg')
const search = require('./controllers/search')

const SESS_CONFIG = {
  key: 'sessionid', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}
app.keys = ['netease', 'msg']

app.use(session(SESS_CONFIG, app))

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

router.post('/login', login)
router.get('/logout', logout)
router.get('/users', getUsers)
router.post('/msgs', getMsg)
router.post('/sync', sync)
router.post('/serverMsg', getServerMsg)
router.get('/search/:keyword', search)

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000)
console.log('[demo] start-quick is starting at port 3000')

module.exports = app
