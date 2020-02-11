export interface AuthAccount {
  name: string
  email: string
  priv: number
}

export interface AuthInfo {
  account: AuthAccount
}
