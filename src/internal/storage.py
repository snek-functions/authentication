import duckdb
from sys import argv

env = os.environ.copy()

if settings.is_offline:
    con = duckdb.connect(':memory:')
else:
    con = duckdb.connect(database=settings.duckdb_path, read_only=False)

    #con = duckdb.connect(':memory:')
    con = duckdb.connect(database='/tmp/db.duckdb', read_only=False)

    if s3_access_key_id:
        con.execute("INSTALL httpfs;")
        con.execute("LOAD httpfs;")

        con.execute(f"SET s3_region='{s3_region}';")
        con.execute(f"SET s3_region='{s3_access_key_id}';")
        con.execute(f"SET s3_region='{s3_secret_access_key}';")
        con.execute(f"SET s3_session_token='{s3_session_token}';")


    # Create a table with all user for authentication.
    # Format:
    # user_id | password |
    # INTEGER | VARCHAR  |
    con.execute(" \
        CREATE TABLE '_user' AS \
        SELECT permissionsmixin_ptr_id as user_id, \
            password \
        FROM parquet_scan('s3://snekauth/_user.parquet'); \
        ORDER BY user_id \
    ")

    # Create table with all alias and associated user for authentication.
    # Format:
    # user_id | alias   |
    # INTEGER | VARCHAR |
    con.execute(" \
        CREATE TABLE '_alias' AS \
        SELECT alias, \
            user_id \
        FROM parquet_scan('s3://snekauth/_alias.parquet'); \
        ORDER BY user_id \
    ")

    # Create table with all user permissions granted and/or inherited
    # for authorization.
    # Format:
    # user_id | permission_id | permission_name | ressources_id
    # INTEGER | INTEGER       | VARCHAR         | INTEGER
    con.execute(" \
        CREATE TABLE '_permission' AS \
        SELECT permissionsmixin_id AS user_id,\
            __permission.id AS permission_id, \
            __permission.name AS permission_name, \
            __permission.ressources_id AS ressources_id \
        FROM 'permission_permission' __permission \
        INNER JOIN user_permissionsmixin_user_permissions __user_permission \
        ON __permission.id = __user_permission.permission_id \
        INNER JOIN user_user __user \
        ON __user.permissionsmixin_ptr_id = __user_permission.permissionsmixin_id \
        UNION \
        SELECT permissionsmixin_id AS user_id, \
            __permission.id AS permission_id, \
            __permission.name AS permission_name, \
            __permission.ressources_id AS ressources_id \
        FROM 'permission_permission' __permission \
        INNER JOIN group_group_permissions __group_permission \
        ON __permission.id = __group_permission.permission_id \
        INNER JOIN user_permissionsmixin_groups __user_group_mix\
        ON __group_permission.group_id = __user_group_mix.group_id \
        ORDER BY user_id \
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
    out = f'{{ \
        "alias": "nobody", \
        "user_id": "0", \
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

    # return user_id
    print(res)

if __name__ == '__main__':
    main(str(argv[1])) 