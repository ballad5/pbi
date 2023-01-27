import { BaseModel } from './base'
import { AdminUser } from '../@types/admin-user'
import { admin, DB } from '../config/firebase'

export class AdminUserModel extends BaseModel {
  constructor () {
    super()
    this.tableName = 'admin_user'
    this.db = DB
    this.querySnapshot = null
  }

  async findOne (email: string): Promise<AdminUser> {

    let ret
    const tbAdminUser = this.db.collection(this.tableName)
    const adminUser = await tbAdminUser.where('email', '==', email).get()
    this.querySnapshot = adminUser.docs
    await this.querySnapshot.forEach((doc) => {
      ret = <AdminUser> doc.data()
    })

    return ret
  }

  async update (item: AdminUser): Promise<boolean> {
    if (!item.email) {
      return false
    }    

    await this.querySnapshot.forEach((doc) => {
      this.db.collection('admin_user').doc(doc.id).update(item)
    })

    return true
  }
}
