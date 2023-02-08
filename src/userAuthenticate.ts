import {
  DUCKDB_ALIAS_PATH,
  DUCKDB_RESOURCE_PATH,
  DUCKDB_USER_PATH
} from './constants.js'
import {fn, spawnChild} from './factory.js'
import {User} from './types.js'

const userAuthenticate = fn<
  {username: string; password: string; resource: string},
  {
    userId: string
  }
>(
  async ({username, password, resource}, _, {req, res}) => {
    const hash = await import('./internal/toolbox/hash/hash.js')

    const userStr = await spawnChild('venv/bin/python', 'internal/storage.py', [
      'search',
      DUCKDB_ALIAS_PATH,
      DUCKDB_USER_PATH,
      DUCKDB_RESOURCE_PATH,
      '--column_value_pairs',
      `resourceId=${resource} alias=${username}`
    ])

    console.log(userStr[0])

    const user = JSON.parse(userStr)[0] as User

    if (user.userId !== '007') {
      if (await hash.verify(password, user.passwordHash)) {
        return {
          userId: user.userId.toString()
        }
      }
    }

    throw new Error(`Unable to authenticate: ${username}`)
  },
  {
    name: 'userAuthenticate'
  }
)

export default userAuthenticate
