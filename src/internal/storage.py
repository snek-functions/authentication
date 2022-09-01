from sys import argv
import duckdb
import settings as settings

print(settings.home)
print(settings.s3_access_key_id)
# print(os.getcwd())

# print(os.path.expanduser('~'))

def main(username):
    #con = duckdb.connect(':memory:')
    con = duckdb.connect(database='/tmp/db.duckdb', read_only=False)

    # out = con.execute("SELECT * FROM duckdb_settings();").fetchall()

    # # return user_id
    # print(f"{out}")

    if settings.s3_access_key_id:
        # con.execute("SET home_directory='/tmp';")
        con.execute("INSTALL httpfs;")
        con.execute("LOAD httpfs;")
        
        # query = f" \
        #     SET s3_region='{settings.s3_region}'; \
        #     SET s3_region='{settings.s3_access_key_id}'; \
        #     SET s3_region='{settings.s3_secret_access_key}'; \
        #     SET s3_session_token=''; \
        # "
        # print(query)
        # con.execute(query)

        con.execute(f"SET s3_region='{settings.s3_region}';")
        con.execute(f"SET s3_access_key_id='{settings.s3_access_key_id}';")
        con.execute(f"SET s3_secret_access_key='{settings.s3_secret_access_key}';")
        #con.execute(f"SET s3_session_token='{settings.s3_session_token}';")


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

    res = con.execute(" \
        SELECT a.alias, u.user_id, u.password FROM '_alias' a, '_user' u \
        WHERE a.user_id=u.user_id AND a.alias=?::STRING \
        LIMIT 1", 
        (username,)
    )

    fetch = res.fetchone()
    out = f"{{ \
        user_id: {fetch[0]}, \
        alias: {fetch[1]}, \
        password: {fetch[2]} \
    }}".replace(" ", "")

    # return user_id
    print(f"{out}")

if __name__ == '__main__':
    main(str(argv[1])) 