import { fn, spawnChild } from './factory';
import { User } from './types';

const authenticate = fn<
  { username: string; password: string },
  {
    user_id: string
  }
>(
  async ({ username, password }, _, req) => {
    // Does one alias per user really make sense?
    console.log(process.env.CODESPACE_NAME)
    // const user = (await storage.queryDatabaseForUser(username)) as User
    const userStr = await spawnChild('venv/bin/python', 'internal/storage.py', [
      username,
      "false"
    ])
    console.log(`test:${userStr}`)
    const user = JSON.parse(userStr) as User
    console.log('test: ', user)

    const { hash } = await import('./internal/index.js')

    if (user.user_id != '0') {
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

      const userStr = await spawnChild('venv/bin/python', 'internal/storage.py', [
        username,
        "true"
      ])

      const reuser = JSON.parse(userStr) as User

      if (await hash.verify(password, reuser.password_hash)) {
        return {
          user_id: reuser.user_id.toString()
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
