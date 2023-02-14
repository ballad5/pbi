import { admin, DB } from '../../config/firebase'
import { Collection, getRepository, BaseFirestoreRepository } from 'fireorm'

export abstract class BaseModel {
  protected tableName: string
  protected db: admin.firestore.Firestore
  // protected db: DB
  protected querySnapshot: any

  constructor() {
    this.db = DB
  }
}

export {Collection, getRepository, BaseFirestoreRepository}
