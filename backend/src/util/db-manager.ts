import { admin, DB } from '../config/firebase'

export class DbManager {

  constructor () {

  }

  getDB (): admin.firestore.Firestore {
    return DB
  }
}
