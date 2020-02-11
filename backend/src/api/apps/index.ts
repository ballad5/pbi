import { Router } from 'express'
import { wrapAsync } from '../../util/wrap-async'
import { get } from './get'
import basic from './basic'
import retention from './retention'

const router = Router()

router.get('/', wrapAsync(get))

router.use('/basic', basic)
router.use('/retention', retention)

export default router
