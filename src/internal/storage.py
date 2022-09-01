from sys import argv
import duckdb
import settings as settings

 
def pull_db(con, duckdb_cached):
    # if not duckdb_cached:
    if settings.s3_access_key_id:
        con.execute("INSTALL httpfs;")
        con.execute("LOAD httpfs;")
        con.execute(f"SET s3_region='{settings.s3_region}';")
        con.execute(f"SET s3_access_key_id='{settings.s3_access_key_id}';")
        con.execute(f"SET s3_secret_access_key='{settings.s3_secret_access_key}';")
    if settings.s3_session_token:
        con.execute(f"SET s3_session_token='{settings.s3_session_token}';")
    

    # Create a table with all user for authentication.
    # Format:
    # user_id | password |
    # INTEGER | VARCHAR  |
    con.execute("DROP TABLE IF EXISTS _user;")
    con.execute(" \
        CREATE TABLE '_user' AS \
        SELECT * \
        FROM parquet_scan('s3://snekauth/_user.parquet') \
        ORDER BY user_id; \
    ")

    # Create table with all alias and associated user for authentication.
    # Format:
    # user_id | alias   |
    # INTEGER | VARCHAR |
    con.execute("DROP TABLE IF EXISTS _alias;")
    con.execute(" \
        CREATE TABLE '_alias' AS \
        SELECT * \
        FROM parquet_scan('s3://snekauth/_alias.parquet') \
        ORDER BY user_id; \
    ")

def main(username):
    #con = duckdb.connect(':memory:')
    con = duckdb.connect(database=settings.duckdb_path, read_only=False)

    # if not settings.duckdb_cached:
    pull_db(con, settings.duckdb_cached)

    res = con.execute(" \
        SELECT a.alias, u.user_id, u.password FROM '_alias' a, '_user' u \
        WHERE a.user_id=u.user_id AND a.alias=?::STRING \
        LIMIT 1", 
        (username,)
    )

    fetch = res.fetchone()
    if fetch:
        out = f'{{ \
            "alias": "{fetch[0]}", \
            "user_id": "{fetch[1]}", \
            "password_hash": "{fetch[2]}" \
        }}'.replace(" ", "")
    else:
        out = f'{{ \
            "alias": "nobody", \
            "user_id": "-1", \
            "password_hash": "undefined" \
        }}'.replace(" ", "")

    print(out)

if __name__ == '__main__':
    main(str(argv[1])) 