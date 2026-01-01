from flask import Flask, jsonify, request
from sqlalchemy import Column, Integer, Table, Column, MetaData, String, Double, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from engine import engine
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
    name = Column(String)
    password_hash = Column(Integer)
    exp = Column(Integer)
    level = Column(Integer)
    exp_to_next_level = Column(Integer)

    
    facts = relationship('facts', secondary='user_fact', back_populates='users')

class Fact(Base):
    __tablename__ = 'facts'

    fact_id = Column(Integer, primary_key=True)
    category = Column(String)
    country_name = Column(String)
    Img_url = Column(String)
    Answer = Column(String)

    users = relationship('users', secondary="user_fact", back_populates="facts")


Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

session = Session()