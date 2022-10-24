import { fn, spawnChild } from './factory';
import { User } from './types';

const authenticate = fn<
  { username: string; password: string },
  {
    user_id: string
  }
>(
  async ({ username, password }, _, req) => {
    const { hash } = await import('./internal/index.js')

    const userStr = await spawnChild('venv/bin/python', 'internal/storage.py', [
      username,
      "false"
    ])
    const user = JSON.parse(userStr) as User

    if (user.user_id !== '0') {
      if (await hash.verify(password, user.password_hash)) {
        return {
          user_id: user.user_id.toString()
        }
      }
    }

    const reuserStr = await spawnChild('venv/bin/python', 'internal/storage.py', [
      username,
      "true"
    ])

    const reuser = JSON.parse(reuserStr) as User

    if (reuser.user_id !== '0') {
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
