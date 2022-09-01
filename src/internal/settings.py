import os

env = os.environ.copy()

home = env.get("HOME", "/tmp")

s3_region = env.get("AWS_REGION", "eu-central-1")
s3_access_key_id = env.get("AWS_ACCESS_KEY_ID", "off")
s3_secret_access_key = env.get("AWS_SECRET_ACCESS_KEY", "off")
s3_session_token = env.get("AWS_SESSION_TOKEN", "off")

duckdb_path=env.get("DUCKDB_PATH", "/tmp/db.duckdb")
duckdb_cached=os.path.exists(duckdb_path)
