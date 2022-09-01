import {fn, spawnChild} from './factory'
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
    // const user = (await storage.queryDatabaseForUser(username)) as User
    const data = await spawnChild('python', 'internal/storage.py', [username,])

    console.log(data)
    // const user: User = {
    //   user_id: '1',
    //   alias: username,
    //   password: password
    // }

    // const hash_algorithm = hashers.getHasher(hash_name);
    // hash_algorithm.verify("password", user.password).then(console.log); // prints true
    // if (await hash.verify(password, user.password_hash)) {
    //   return {
    //     user_id: user.user_id.toString()
    //   }
    // }

    //throw new Error(`Unable to authenticate: ${username}`)
    return { user_id: "string;" }
  },
  {
    name: 'authenticate'
  }
)

export default authenticate
