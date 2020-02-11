import { Router } from 'express'
import { wrapAsync } from '../../../util/wrap-async'
import { get } from './get'
// import { put } from './put'

const router = Router()

router.get('/', wrapAsync(get))

export default router
