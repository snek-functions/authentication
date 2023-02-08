from os import environ
from sys import argv

from pit import Pit, cli

env = environ.copy()

app = Pit(__name__, model_folder="models")

app.config['HOME'] = env.get("HOME", "/var/task")

app.config['AWS_REGION'] = env.get("AWS_REGION", "")
app.config['AWS_ACCESS_KEY_ID'] = env.get("AWS_ACCESS_KEY_ID", "")
app.config['AWS_SECRET_ACCESS_KEY'] = env.get("AWS_SECRET_ACCESS_KEY", "")

app.config['AWS_SESSION_TOKEN'] = env.get("AWS_SESSION_TOKEN", "")
app.config['IS_OFFLINE'] = env.get("IS_OFFLINE", "")
app.config['DUCKDB_PATH'] = env.get("DUCKDB_PATH", "/tmp/db.duckdb")
app.config['DUCKDB_DATA_PATH'] = env.get("DUCKDB_DATA_PATH", "/var/duckdb")

app.config['SQLALCHEMY_DATABASE_URI'] = "duckdb:///:memory:"


# print(app.config)

# db = app.db


# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)

#     def __repr__(self):
#         return f"<User {self.username}>"


# get input variables argv
#
#
# print(argv)

# Call the main function and pass the commandline arguments
app.main(*argv[1:], **vars(cli()))
