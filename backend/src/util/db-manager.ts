import { admin, DB } from '../config/firebase'

export class DbManager {

  getDB (): admin.firestore.Firestore {
    return DB
  }
}
