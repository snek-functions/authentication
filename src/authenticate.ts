import {fn} from './factory'
import {User} from './types'
import {storage, hash} from './internal/index.js'

const authenticate = fn<
  {username: string; password: string},
  {
    user_id: string
  }
>(
  async ({username, password}, _, req) => {
    // Does one alias per user really make sense?
    const user = (await storage.queryDatabaseForUser(username)) as User

    // const user: User = {
    //   uid: '1',
    //   alias: username,
    //   password: password
    // }

    // const hash_algorithm = hashers.getHasher(hash_name);
    // hash_algorithm.verify("password", user.password).then(console.log); // prints true
    if (await hash.verify(password, user.password)) {
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
