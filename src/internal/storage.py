from sys import argv
import duckdb
import settings as settings

#con = duckdb.connect(':memory:')
con = duckdb.connect(database=settings.duckdb_path, read_only=False)
duckdb_cached = settings.duckdb_cached

def pull_db():
    if settings.is_offline:
        con.execute("INSTALL httpfs;")
    con.execute("LOAD httpfs;")

    if settings.s3_access_key_id:
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

def fetch(username):
    try:
        res = con.execute(" \
            SELECT a.alias, u.user_id, u.password FROM '_alias' a, '_user' u \
            WHERE a.user_id=u.user_id AND a.alias=?::STRING \
            LIMIT 1", 
            (username,)
        )

        return res.fetchone()

    except:
        return ()


def main(username):
    # if not settings.duckdb_cached:
    out = f'{{ \
        "alias": "nobody", \
        "user_id": "-1", \
        "password_hash": "undefined" \
    }}'.replace(" ", "")

    fetched = fetch(username)
    
    if fetched:
        out = f'{{ \
            "alias": "{fetched[0]}", \
            "user_id": "{fetched[1]}", \
            "password_hash": "{fetched[2]}" \
        }}'.replace(" ", "")
    else:
        pull_db()
        refetched = fetch(username)

        if refetched:
            out = f'{{ \
                "alias": "{refetched[0]}", \
                "user_id": "{refetched[1]}", \
                "password_hash": "{refetched[2]}" \
            }}'.replace(" ", "")

    print(out)

if __name__ == '__main__':
    main(str(argv[1])) 