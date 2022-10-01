import duckdb

con = duckdb.connect(':memory:')
con.execute("INSTALL httpfs;")
