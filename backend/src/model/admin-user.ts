import { BaseModel, Collection, getRepository, BaseFirestoreRepository } from './base'
import { AdminUser } from '../@types/admin-user'

@Collection('admin_user')
class AdminUserModel implements AdminUser {
  id: string
  email: string
  password: string
  name: string
  date_reg: number
  date_mod: number
  salt: string
}

export class AdminUserRepository extends BaseModel {
  private rep
  constructor () {
    super()
    this.tableName = 'admin_user'
  }

  async init () {
    try {
      this.rep = getRepository(AdminUserModel)
    } catch (err) {
      throw err
    }
  }

  async findOne (email: string): Promise<AdminUser> {
    try {
      return await this.rep.whereEqualTo('email', email).findOne()
    } catch (err) {
      throw err
    }
  }

  async update (item: AdminUser) {
    try {
      await this.rep.update(item)
    } catch (err) {
      throw err
    }
  }
}
