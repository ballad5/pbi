// import { ApiError } from '../../utils/error'
// import { DbManager } from '../../utils/db-manager'
// import { DB } from '../../util/db'
// import { db } from '../../config/firebase'
import * as admin from 'firebase-admin'

export abstract class BaseModel {
  protected tableName: string
  protected db: admin.firestore.Firestore
  protected querySnapshot: any
}
