import {Connection, DuckDB, IExecuteOptions, RowResultFormat} from 'node-duckdb'

const executeOptions: IExecuteOptions = {
  rowResultFormat: RowResultFormat.Object
}

export async function queryDatabaseWithIterator(user: string) {
  // create new database in memory
  const db = new DuckDB()
  // create a new connection to the database
  const connection = new Connection(db)

  console.log(process.env.AWS_ACCESS_KEY_ID)
  // perform some queries
  //console.log(`SET s3_access_key_id='${process.env.AWS_ACCESS_KEY_ID}${process.env.AWS_SECRET_ACCESS_KEY}'`)
  await connection.executeIterator(`SET s3_region='eu-central-1'`)
  await connection.executeIterator(
    `SET s3_access_key_id='${process.env.AWS_ACCESS_KEY_ID}'`
  )
  await connection.executeIterator(
    `SET s3_secret_access_key='${process.env.AWS_SECRET_ACCESS_KEY}'`
  )
  if (process.env.AWS_SESSION_TOKEN) {
    await connection.executeIterator(
      `SET s3_session_token='${process.env.AWS_SESSION_TOKEN}'`
    )
  }

  await connection.executeIterator(
    "CREATE TABLE 'user' AS SELECT * FROM parquet_scan('s3://snekauth/0_user.parquet')"
  )
  await connection.executeIterator(
    "CREATE TABLE 'alias' AS SELECT * FROM parquet_scan('s3://snekauth/1_alias.parquet')"
  )
  // await connection.executeIterator("CREATE TABLE 'user' (uid INTEGER, password VARCHAR)")
  // await connection.executeIterator("CREATE TABLE 'alias' (uid INTEGER, alias VARCHAR)")
  // await connection.executeIterator("INSERT INTO 'user' VALUES (1 , 'ciscocisco');")
  // await connection.executeIterator("INSERT INTO 'alias' VALUES (1 , 'cisco');")
  // await connection.executeIterator("INSERT INTO 'alias' VALUES (1 , 'ci@s.co');")
  // await connection.executeIterator("EXPORT DATABASE './' (FORMAT PARQUET)")

  const result = await connection.executeIterator(
    `SELECT * FROM 'alias' a, 'user' u WHERE a.uid=u.uid AND a.alias='${user}' LIMIT 1`,
    executeOptions
  )

  // const password = await connection.executeIterator(
  //   "SELECT password FROM 'user' WHERE alias='cisco' LIMIT 1",
  //   executeOptions,
  // )
  //const result = await connection.executeIterator("SELECT id FROM parquet_scan('https://github.com/deepcrawl/node-duckdb/raw/master/src/tests/test-fixtures/alltypes_plain.parquet') WHERE id=5;")
  //await connection.executeIterator("CREATE TABLE 'user' AS SELECT * FROM 'user.parquet';")
  //const result = await connection.executeIterator("SELECT * FROM 'user' WHERE id=5;")

  // fetch and print result
  const res = result.fetchRow()
  //console.log(result.fetchRow())

  // release resources
  connection.close()
  db.close()

  return res
}
// sql = `copy (select * from '${input}') to  '${output}'(FORMAT PARQUET)`;

// db.all(sql, (err,d) => console.log(err ? 'Error: '+err.message : d));
