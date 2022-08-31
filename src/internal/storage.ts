import duckdb from 'duckdb'

const s3_region = 'eu-central-1'
const s3_access_key_id = process.env.AWS_ACCESS_KEY_ID || ''
const s3_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY || ''
const s3_session_token = process.env.AWS_SESSION_TOKEN || ''

export async function queryDatabaseForUser(username: string) {
  // create new atabase in memory
  const con = new duckdb.duckdb.Database(':memory:')

  // create a new connection to the database
  if (s3_access_key_id) {
    con.run('INSTALL httpfs;')
    con.run('LOAD httpfs;')

    con.run(`SET s3_region='${s3_region}'`)
    con.run(`SET s3_access_key_id='${s3_access_key_id}'`)
    con.run(`SET s3_secret_access_key='${s3_secret_access_key}'`)

    if (process.env.AWS_SESSION_TOKEN) {
      con.run(`SET s3_session_token='${s3_session_token}'`)
    }

    con.run(
      `CREATE TABLE 'user' AS SELECT * FROM parquet_scan('s3://snekauth/_user.parquet');`,
      function (err) {
        if (err) {
          throw err
        }
        console.log(`Successfully imported _user.parquet from s3`)
      }
    )

    con.run(
      `CREATE TABLE 'alias' AS SELECT * FROM parquet_scan('s3://snekauth/_alias.parquet');`,
      function (err) {
        if (err) {
          throw err
        }
        console.log(`Successfully imported _alias.parquet from s3`)
      }
    )
  }

  // Perform some queries

  const promiseConAll = (
    sql: string,
    params: duckdb.duckdb.Scalar[]
  ): Promise<duckdb.duckdb.Row[]> => {
    return new Promise((resolve, reject) => {
      con.all(sql, params, (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res)
      })
    })
  }

  const rows = await promiseConAll(
    "SELECT * FROM 'alias' a, 'user' u WHERE a.user_id=u.user_id AND a.alias=?::STRING LIMIT 1",
    [username]
  )

  let res = rows[0]

  return res
}
