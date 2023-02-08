export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface User {
  userId: string
  resourceId: string
  username: string
  passwordHash: string
}
