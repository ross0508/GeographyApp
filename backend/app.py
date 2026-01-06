from flask import Flask, jsonify, request, send_from_directory
from sqlalchemy import Column, Integer, Table, Column, MetaData, String, Double, ForeignKey, LargeBinary, func, or_, and_
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

IMAGE_FOLDER = os.getenv("IMAGE_FOLDER")
app.config['UPLOAD_FOLDER'] = IMAGE_FOLDER

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

    friends = relationship('Friend', foreign_keys="Friend.user1", back_populates='user1_friend', cascade="all, delete-orphan")
    friends2 = relationship('Friend', foreign_keys="Friend.user2", back_populates='user2_friend', cascade="all, delete-orphan")

    sent_requests = relationship('FriendRequest', foreign_keys="FriendRequest.sender", back_populates='sender_user')
    received_requests = relationship('FriendRequest', foreign_keys="FriendRequest.reciever", back_populates='receiver_user')


class Fact(Base):
    __tablename__ = 'facts'

    fact_id = Column(Integer, primary_key=True)
    category = Column(String)
    country_name = Column(String)
    continent = Column(String)
    img_url = Column(String)
    answer = Column(String)
    difficulty = Column(Integer)

    users = relationship('User', secondary="user_fact", back_populates="facts")

class Friend(Base):
    __tablename__ = 'friends'

    id = Column(Integer, primary_key=True)
    user1 = Column(Integer, ForeignKey('users.user_id'))
    user2 = Column(Integer, ForeignKey('users.user_id'))

    user1_friend = relationship('User', foreign_keys=[user1], back_populates='friends')
    user2_friend = relationship('User', foreign_keys=[user2], back_populates='friends2')

class FriendRequest(Base):
    __tablename__ = 'friend_requests'

    request_id = Column(Integer, primary_key=True)
    sender = Column(Integer, ForeignKey('users.user_id'))
    reciever = Column(Integer, ForeignKey('users.user_id'))

    sender_user = relationship('User', foreign_keys="FriendRequest.sender", back_populates='sent_requests')
    receiver_user = relationship('User', foreign_keys="FriendRequest.reciever", back_populates='received_requests')



Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

session = Session()


@app.post("/register")
def create_account():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    userExists = session.query(User).filter_by(username=username).one_or_none()

    if userExists:
        return jsonify({'Error': 'Username already in use'}), 400

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user = User(username=username, password_hash=password_hash, exp=0, level=1, exp_to_next_level=100)

    session.add(user)

    session.commit()
    print("token")
    token = create_access_token(identity=username)
    print("return")
    return jsonify({'token': token}), 200


@app.post("/login")
def create_token():
    username = request.json.get("username")

    password = request.json.get("password")

    user = session.query(User).filter_by(username=username).one_or_none()
    
    if user:
        login_successful = bcrypt.checkpw(password.encode('utf-8'), user.password_hash)
        if login_successful:
            token = create_access_token(identity=username)
            return jsonify({'token': token}), 200

    return jsonify({'Error':'Incorrect username or password'}), 400
   

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


@app.get("/facts/new/<length>")
@jwt_required()
def getNewFacts(length):
    length = int(length)

    username = get_jwt_identity()
    user = session.query(User).filter_by(username=username).one_or_none()

    # Get In-Progress Facts
    user_facts = session.query(UserFact).filter(UserFact.user_id == user.user_id, UserFact.exp < 100).limit(length).all()

    in_progress_fact_ids = [user_fact.fact_id for user_fact in user_facts]

    # Get Not-In-Progress Facts
    if len(user_facts) < length:
        additional_facts = session.query(Fact).outerjoin(UserFact).filter(Fact.fact_id.notin_(in_progress_fact_ids), (UserFact.exp != 100) | (UserFact.exp == None)).order_by(Fact.difficulty).limit(length - len(user_facts)).all()
        user_facts.extend(additional_facts)

    user_fact_ids = [user_fact.fact_id for user_fact in user_facts]

    facts = session.query(Fact).filter(Fact.fact_id.in_(user_fact_ids)).order_by(func.random()).all()

    facts_list = [{"fact_id": fact.fact_id, "category": fact.category, 
                   "country_name": fact.country_name, "img_url": fact.img_url, 
                   "answer": fact.answer, "difficulty": fact.difficulty,
                   "continent": fact.continent} for fact in facts]
                   

    return jsonify(facts_list)

@app.get("/facts/known/<length>")
@jwt_required()
def getKnownFacts(length):
    length = int(length)

    username = get_jwt_identity()
    user = session.query(User).filter_by(username=username).one_or_none()

    user_facts = session.query(UserFact).filter(UserFact.user_id == user.user_id, UserFact.exp == 100).limit(length).all()

    userfact_ids = [user_fact.fact_id for user_fact in user_facts]

    facts = session.query(Fact).filter(Fact.fact_id.in_(userfact_ids)).order_by(func.random()).all()

    facts_list = [{"fact_id": fact.fact_id, "category": fact.category, 
                   "country_name": fact.country_name, "img_url": fact.img_url, 
                   "answer": fact.answer, "difficulty": fact.difficulty,
                   "continent": fact.continent} for fact in facts]
    
    return jsonify(facts_list)


@app.post("/friends/requests/<friendname>")
@jwt_required()
def createFriendRequest(friendname):
    username = get_jwt_identity()
    
    if username == friendname:
        print("send to self")
        return {"Error": "Can't send friend request to self"}, 400
    
    user = session.query(User).filter_by(username=username).one_or_none()


    friend = session.query(User).filter_by(username=friendname).one_or_none()

    if not friend:
        return {"Error": "User does not exist"}, 400
    
    already_exists = session.query(FriendRequest).filter_by(sender=user.user_id, reciever=friend.user_id).one_or_none()
    
    if already_exists:
        print("already sent")
        return {"Error": "Already sent"}, 400

    friendRequest = FriendRequest(sender=user.user_id, reciever=friend.user_id)

    session.add(friendRequest)

    session.commit()

    return jsonify({"Success": "Friend Request Sent"}), 200


@app.get('/friends/requests')
@jwt_required()
def getFriendRequests():
    username = get_jwt_identity()
    user = session.query(User).filter_by(username=username).one_or_none()

    requests = user.received_requests

    sender_ids = [request.sender for request in requests]

    senders = session.query(User).filter(User.user_id.in_(sender_ids)).all()

    id_to_name = dict()
    for sender in senders:
        id_to_name[sender.user_id] = sender.username

    request_list = [{"request_id": request.request_id, "sender_name": id_to_name[request.sender], "reciever": request.reciever} for request in requests]

    return jsonify(request_list)


@app.put('/friends/requests/<request_id>')
@jwt_required()
def respondFriendRequest(request_id):
    accept = request.json.get("accept")

    friendRequest = session.query(FriendRequest).filter_by(request_id=request_id).one_or_none()

    if not friendRequest:
        return {"Error": "Friend request does not exist"}, 400

    if accept:
        already_exists = session.query(Friend).filter(
        or_(
            and_(
                Friend.user1 == friendRequest.sender,
                Friend.user2 == friendRequest.reciever
            ),
            and_(
                Friend.user1 == friendRequest.reciever,
                Friend.user2 == friendRequest.sender
            )
        )
    ).first()

        if already_exists:
            return {"Error": "Already Friends"}, 400

        friendship = Friend(user1=friendRequest.sender, user2=friendRequest.reciever)
        session.add(friendship)

    session.delete(friendRequest)
    session.commit()

    return {"Success": "Responded successfully"}, 200


@app.get('/friends')
@jwt_required()
def getFriends():
    username = get_jwt_identity()

    user = session.query(User).filter(User.username == username).one_or_none()
    
    if user:
        all_friends = user.friends + user.friends2
        
        friend_usernames = []
        for friend_relation in all_friends:
            if friend_relation.user1 == user.user_id:
                friend_usernames.append(friend_relation.user2_friend.username)
            else:
                friend_usernames.append(friend_relation.user1_friend.username)

        return friend_usernames


@app.route('/img/<filename>')
def getImage(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


