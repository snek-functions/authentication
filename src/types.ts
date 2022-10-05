export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface User {
  user_id: string
  alias: string
  password_hash: string
}