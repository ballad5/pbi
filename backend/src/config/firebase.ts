
import * as admin from 'firebase-admin'

const serviceAccount = require('./api-server-95baf-firebase-adminsdk-eq8zr-9d9038589b.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const DB = admin.firestore()

export { admin, DB }
