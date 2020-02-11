import { Router } from 'express'
import { postSignIn } from './signin'
import { get } from './get'
import { wrapAsync } from '../../util/wrap-async'

const router = Router()

router.post('/signin', wrapAsync(postSignIn))
router.get('/', wrapAsync(get))

export default router
