import express from 'express'
import jwt from 'express-jwt'
import { ApiError, ErrorDefine } from './util/error'
import api from './api'
import { AppSecret } from './config/secret'
import { config } from 'dotenv'

config()
const app = express()

app.set('port', process.env.PORT || 1340)
app.use(require('connect-history-api-fallback')())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'local') {
    console.log(`request url: ${req.url}`)
  }
  next()
})

app.use(jwt({
  secret: AppSecret.jwtToken,
  requestProperty: 'auth',
  algorithms: ['HS256']
}).unless({ path: ['/', '/api/account/signin', '/api/account', /^(?!\/api\/).*$/g] }))
app.use('/api', api)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.error(`not found error. (url: ${req.url})`)
  next(new ApiError(ErrorDefine.NOT_FOUND_ERROR))
})

app.use((err: ApiError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  let code: number = err.name === 'UnauthorizedError' ? 401 : 500
  let message: string = err.message
  if (err.code && typeof err.code === 'number') {
    code = err.code
  }
  res.status(code).send({ error: { message } })
})

const server = app.listen(app.get('port'), () => {
  console.log('*** App is running at http://localhost:%d in %s mode [%s]', app.get('port'), process.env.NODE_ENV, (new Date()).toISOString())
})

export default server
