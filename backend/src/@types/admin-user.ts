export interface AdminUser {
  id: string
  email: string
  password: string
  name: string
  date_reg: number
  date_mod: number
  salt: string
}
