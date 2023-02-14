import * as admin from 'firebase-admin'
import * as fireorm from 'fireorm'

const serviceAccount = require('./api-server-95baf-firebase-adminsdk-eq8zr-9d9038589b.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
})

const DB = admin.firestore()
fireorm.initialize(DB)

export { admin, DB }
