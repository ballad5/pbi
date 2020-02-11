import express from 'express'
import account from './account'
import apps from './apps'
import settings from './settings'

const router = express.Router()

router.use('/account', account)
router.use('/apps', apps)
router.use('/settings', settings)

export default router
