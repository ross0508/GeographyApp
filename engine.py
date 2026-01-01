from sqlalchemy import create_engine
from sqlalchemy.engine import URL

url = URL.create(
    drivername="postgresql",
    username="postgres",
    host="localhost",
    port="5432",
    database="geographyapp"
)

engine = create_engine(url)
