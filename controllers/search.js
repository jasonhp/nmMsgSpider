const { Client } = require('elasticsearch')

const client = new Client({
  host: '127.0.0.1:9200',
  log: 'trace'
})
const INDEX = 'index'

module.exports = async (ctx, next) => {
  console.log(ctx.params.keyword)
  try {
    const result = await client.search({
      q: ctx.params.keyword,
      index: INDEX,
      size: 999,
    })

    ctx.body = {
      code: 0,
      data: result,
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