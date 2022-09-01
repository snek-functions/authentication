import { fn, spawnChild } from './factory'
import { hash, storage } from './internal/index.js'
import { User } from './types'

const authenticate = fn<
  { username: string; password: string },
  {
    user_id: string
  }
>(
  async ({ username, password }, _, req) => {
    // Does one alias per user really make sense?

    // const user = (await storage.queryDatabaseForUser(username)) as User
    const userStr = await spawnChild('venv/bin/python', 'internal/storage.py', [username,])
    console.log(`test:${userStr}`)
    const user = JSON.parse(userStr) as User
    console.log("test: ", user)
    
    if (user.user_id != "-1") {
 
      // const user: User = {
      //   user_id: '1',
      //   alias: username,
      //   password: password
      // }

      if (await hash.verify(password, user.password_hash)) {
        return {
          user_id: user.user_id.toString()
        }
      }
    }
    throw new Error(`Unable to authenticate: ${username}`)
  },
  {
    name: 'authenticate'
  }
)

export default authenticate
