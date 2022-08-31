import { pbkdf2 } from 'crypto'

export async function verify(password: string, hash: string) {
  return new Promise((resolve, reject) => {
    try {
      const keyLength = 32
      const arrHash = hash.split('$')
      const digest = arrHash[0].split('_')[1]
      const iterations = +arrHash[1]
      const salt = arrHash[2]
      const key = arrHash[3]

      pbkdf2(
        password,
        salt,
        iterations,
        keyLength,
        digest,
        (error, derivedKey): void => {
          if (error) {
            return reject(error)
          }

          resolve(derivedKey.toString('base64') === key)
        }
      )
    } catch (error) {
      return reject(error)
    }
  })
}
