import {fn} from './factory'
import {User} from './types'

const authenticate = fn<
  {username: string; password: string},
  {
    uid: string
  }
>(
  async ({username, password}, _, req) => {
    // Does one alias per user really make sense?
    // const user = (await storage.queryDatabaseWithIterator(username)) as {
    //   uid: number
    //   alias: string
    //   password: string
    // }

    const user: User = {
      uid: '1',
      alias: username,
      password: password
    }

    if (username === user.alias && password === user.password) {
      return {
        uid: user.uid.toString()
      }
    }

    throw new Error(`Unable to authenticate: ${username}`)
  },
  {
    name: 'authenticate'
  }
)

export default authenticate
