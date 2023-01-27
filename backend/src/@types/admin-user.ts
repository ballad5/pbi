export interface AdminUser {
  email: string
  password: string
  name: string
  date_reg: number
  date_mod: number
  salt: string
}