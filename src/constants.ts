import {url} from './factory'

export const HOME = process.env.HOME || '/var/task'

export const AWS_REGION = process.env.AWS_REGION || 'eu-central-1'
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ''
export const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN || ''

export const IS_OFFLINE = process.env.IS_OFFLINE || ''

export const DUCKDB_DATA_PATH = process.env.DUCKDB_DATA_PATH || '/var/duckdb'
export const DUCKDB_PATH = process.env.DUCKDB_PATH || '/tmp/db.duckdb'

export const DUCKDB_USER_PATH =
  process.env.DUCKDB_USER_PATH || DUCKDB_DATA_PATH + '/_user.parquet'
export const DUCKDB_ALIAS_PATH =
  process.env.DUCKDB_ALIAS_PATH || DUCKDB_DATA_PATH + '/_alias.parquet'
export const DUCKDB_RESOURCE_PATH =
  process.env.DUCKDB_RESOURCE_PATH || DUCKDB_DATA_PATH + '/_resource.parquet'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ciscocisco'

export const TOKEN_COOKIE_NAME = 'T'
export const REFRESH_TOKEN_COOKIE_NAME = 'RT'
export const USER_DATA_TOKEN_NAME = 'U'

export const LOGIN_COOKIE_SECURE = true
export const LOGIN_COOKIE_SAME_SITE = 'none'
export const LOGIN_COOKIE_PATH = '/'
export const LOGIN_COOKIE_DOMAIN = new URL(url).hostname
export const LOGIN_COOKIE_HTTP_ONLY = true

export const LOGIN_TOKEN_COOKIE_MAX_AGE = 60 * 15 // 15 minutes
export const LOGIN_REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const COOKIE_OPTIONS: {
  httpOnly: boolean
  secure: boolean
  sameSite: boolean | 'strict' | 'lax' | 'none' | undefined
  path: string
  domain: string
} = {
  httpOnly: LOGIN_COOKIE_HTTP_ONLY,
  secure: LOGIN_COOKIE_SECURE,
  sameSite: LOGIN_COOKIE_SAME_SITE,
  path: LOGIN_COOKIE_PATH,
  domain: LOGIN_COOKIE_DOMAIN
}
