from flask import Flask, jsonify, request
from sqlalchemy import Column, Integer, Table, Column, MetaData, String, Double, ForeignKey, LargeBinary, func
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from engine import engine
import json
from flask_cors import CORS
from flask_jwt_extended import create_access_token, JWTManager, get_jwt_identity, jwt_required
import bcrypt
import os
from dotenv import load_dotenv


app = Flask(__name__)

load_dotenv()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY

CORS(app)

jwt = JWTManager(app)

connection = engine.connect()

Base = declarative_base()


class UserFact(Base):
    __tablename__ = 'user_fact'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    fact_id = Column(Integer, ForeignKey('facts.fact_id'))
    exp = Column(Integer)
    

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
    img_url = Column(String)
    answer = Column(String)

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
            return {"token": token}

    return {"Error": "Incorrect username or password"}
   

@app.post("/test")
@jwt_required()
def test():
    return {"bruh": "bruvvvvvv"}

@app.put("/users/exp")
@jwt_required()
def addExp():
    username = get_jwt_identity()
    user = session.query(User).filter_by(username=username).one_or_none()
    fact_id = request.json.get('fact_id')

    user_fact = session.query(UserFact).filter_by(user_id=user.user_id, fact_id=fact_id).one_or_none()
    user = session.query(User).filter_by(user_id=user.user_id).one_or_none()

    if not user_fact:
        user_fact = UserFact(user_id=user.user_id, fact_id=fact_id, exp=0)
        session.add(user_fact)

    user_fact.exp = user_fact.exp + 20

    if user_fact.exp >= 100:
        user_fact.exp = 100
    else:
        user.exp = user.exp + 20

        if user.exp >= user.exp_to_next_level:
            user.level = user.level + 1
            user.exp = user.exp - user.exp_to_next_level
            user.exp_to_next_level = user.exp_to_next_level * 1.2

    
    

    session.commit()

    return {"200": "Exp added successfully"}


@app.get("/facts/known/<length>")
@jwt_required()
def getNewFacts(length):
    length = int(length)

    username = get_jwt_identity()
    user = session.query(User).filter_by(username=username).one_or_none()

    # Get In Progress Facts
    user_facts = session.query(UserFact).filter(UserFact.user_id == user.user_id, UserFact.exp < 100).limit(length).all()

    in_progress_fact_ids = [user_fact.fact_id for user_fact in user_facts]

    if len(user_facts) < length:
        additional_facts = session.query(Fact).filter(Fact.fact_id.notin_(in_progress_fact_ids)).limit(length - len(user_facts)).all()
        user_facts.extend(additional_facts)

    user_fact_ids = [user_fact.fact_id for user_fact in user_facts]

    facts = session.query(Fact).filter(Fact.fact_id.in_(user_fact_ids)).order_by(func.random()).all()

    facts_list = [{"fact_id": fact.fact_id, "category": fact.category, 
                   "country_name": fact.country_name, "img_url": fact.img_url, 
                   "answer": fact.answer} for fact in facts]

    return jsonify(facts_list)