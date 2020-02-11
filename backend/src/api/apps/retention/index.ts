import { Router } from 'express'
import { wrapAsync } from '../../../util/wrap-async'
import { get } from './get'

const router = Router()

router.get('/:appId', wrapAsync(get))

export default router
