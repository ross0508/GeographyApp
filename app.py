from flask import Flask, jsonify, request
from sqlalchemy import Column, Integer, Table, Column, MetaData, String, Double, ForeignKey, LargeBinary
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from engine import engine
import json
from flask_cors import CORS
from flask_jwt_extended import create_access_token, JWTManager, get_jwt_identity, jwt_required
import bcrypt

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "sleepyjoe"

CORS(app)

jwt = JWTManager(app)

connection = engine.connect()

Base = declarative_base()


class UserFact(Base):
    __tablename__ = 'user_fact'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    fact_id = Column(Integer, ForeignKey('facts.fact_id'))
    

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True)
    username = Column(String)
    password_hash = Column(LargeBinary)
    exp = Column(Integer)
    level = Column(Integer)
    exp_to_next_level = Column(Integer)

    
    facts = relationship('Fact', secondary='user_fact', back_populates='users')

class Fact(Base):
    __tablename__ = 'facts'

    fact_id = Column(Integer, primary_key=True)
    category = Column(String)
    country_name = Column(String)
    Img_url = Column(String)
    Answer = Column(String)

    users = relationship('User', secondary="user_fact", back_populates="facts")


Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

session = Session()

@app.post("/register")
def create_account():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user = User(username=username, password_hash=password_hash, exp=0, level=1, exp_to_next_level=100)

    session.add(user)

    session.commit()

    return {"bruh": "bruh"}


@app.post("/login")
def create_token():
    username = request.json.get("username")

    password = request.json.get("password")

    user = session.query(User).filter_by(username=username).one_or_none()
    
    if user:
        login_successful = bcrypt.checkpw(password.encode('utf-8'), user.password_hash)
        if login_successful:
            token = create_access_token(identity=username)
            return {username: token}

    return {"Error": "Incorrect username or password"}
   

@app.post("/test")
@jwt_required()
def test():
    return {"bruh": "bruvvvvvv"}