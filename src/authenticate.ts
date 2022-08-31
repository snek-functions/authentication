import {fn} from './factory'
import {hash, storage} from './internal/index.js'
import {User} from './types'

const authenticate = fn<
  {username: string; password: string},
  {
    user_id: string
  }
>(
  async ({username, password}, _, req) => {
    // Does one alias per user really make sense?
    const user = (await storage.queryDatabaseForUser(username)) as User

    if (await hash.verify(password, user.password_hash)) {
      return {
        user_id: user.user_id.toString()
      }
    }

    throw new Error(`Unable to authenticate: ${username}`)
  },
  {
    name: 'authenticate'
  }
)

export default authenticate
