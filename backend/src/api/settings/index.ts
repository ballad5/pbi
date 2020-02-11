import { Router } from 'express'
import { wrapAsync } from '../../util/wrap-async'
import { get } from './get'
import accounts from './accounts'

const router = Router()

router.get('/', wrapAsync(get))

router.use('/accounts', accounts)

export default router
