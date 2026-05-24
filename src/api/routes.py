from flask import request, jsonify, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash
import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

api = Blueprint('api', __name__)
CORS(api)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend"}), 200

@api.route('/signup', methods=['POST'])
def signup():
    body = request.get_json()
    first_name = body.get("first_name")
    last_name = body.get("last_name")
    email = body.get("email")
    password = body.get("password")
    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400
    new_user = User(first_name=first_name, last_name=last_name, email=email, is_active=True)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully", "user": new_user.serialize()}), 201

@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not user.check_password(data.get("password")):
        return jsonify({"msg": "Invalid email or password"}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": access_token,
        "user": user.serialize()
    }), 200

@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200

@api.route('/user/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.serialize()), 200

@api.route('/user/<int:user_id>', methods=['PUT'])
def edit_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    body = request.get_json()
    if not body:
        return jsonify({"error": "No data provided"}), 400
    if "first_name" in body:
        user.first_name = body["first_name"]
    if "last_name" in body:
        user.last_name = body["last_name"]
    if "email" in body:
        existing = User.query.filter_by(email=body["email"]).first()
        if existing and existing.id != user_id:
            return jsonify({"error": "Email already in use"}), 400
        user.email = body["email"]
    if "nickname" in body:
        user.nickname = body["nickname"]
    if "gender" in body:
        user.gender = body["gender"]
    if "date_of_birth" in body:
        user.date_of_birth = body["date_of_birth"]
    if "weight" in body:
        user.weight = body["weight"]
    if "height" in body:
        user.height = body["height"]
    if "phone_number" in body:
        user.phone_number = body["phone_number"]
    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "user": user.serialize()}), 200

@api.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Account deleted successfully"}), 200

@api.route('/user/<int:user_id>/photo', methods=['POST'])
def upload_user_photo(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if 'photo' not in request.files:
        return jsonify({"error": "No photo provided"}), 400
    file = request.files['photo']
    result = cloudinary.uploader.upload(
        file,
        folder="gymmind/avatars",
        public_id=f"user_{user_id}",
        overwrite=True,
        resource_type="image"
    )
    user.photo_url = result.get("secure_url")
    db.session.commit()
    return jsonify({"message": "Photo uploaded successfully", "photo_url": user.photo_url}), 200

# PROGRESS LOG ENDPOINTS
@api.route('/progress/<int:user_id>', methods=['GET'])
@jwt_required()
def get_progress(user_id):
    from api.models import ProgressLog
    logs = ProgressLog.query.filter_by(user_id=user_id).order_by(ProgressLog.date.desc()).all()
    return jsonify([log.serialize() for log in logs]), 200

@api.route('/progress', methods=['POST'])
@jwt_required()
def add_progress():
    from api.models import ProgressLog
    from datetime import date
    body = request.get_json()
    user_id = body.get("user_id")
    weight = body.get("weight")
    if not user_id or not weight:
        return jsonify({"error": "user_id and weight are required"}), 400
    existing = ProgressLog.query.filter_by(user_id=user_id, date=date.today()).first()
    if existing:
        return jsonify({"error": "You already logged your weight today"}), 400
    log = ProgressLog(user_id=user_id, weight=weight, date=date.today())
    db.session.add(log)
    db.session.commit()
    return jsonify(log.serialize()), 201

# MOOD CHECK ENDPOINTS
@api.route('/mood/<int:user_id>', methods=['GET'])
@jwt_required()
def get_moods(user_id):
    from api.models import MoodCheck
    moods = MoodCheck.query.filter_by(user_id=user_id).order_by(MoodCheck.date.desc()).all()
    return jsonify([mood.serialize() for mood in moods]), 200

@api.route('/mood', methods=['POST'])
@jwt_required()
def add_mood():
    from api.models import MoodCheck
    from datetime import date
    body = request.get_json()
    user_id = body.get("user_id")
    mood = body.get("mood")
    ai_message = body.get("ai_message")
    if not user_id or not mood:
        return jsonify({"error": "user_id and mood are required"}), 400
    existing = MoodCheck.query.filter_by(user_id=user_id, date=date.today()).first()
    if existing:
        return jsonify({"error": "You already logged your mood today"}), 400
    mood_check = MoodCheck(user_id=user_id, mood=mood, ai_message=ai_message, date=date.today())
    db.session.add(mood_check)
    db.session.commit()
    return jsonify(mood_check.serialize()), 201

# WORKOUT ENDPOINTS
@api.route('/workout/<int:user_id>', methods=['GET'])
@jwt_required()
def get_workouts(user_id):
    from api.models import Workout
    workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.date.desc()).all()
    return jsonify([w.serialize() for w in workouts]), 200

@api.route('/workout', methods=['POST'])
@jwt_required()
def add_workout():
    from api.models import Workout, WorkoutExercise
    from datetime import date
    body = request.get_json()
    user_id = body.get("user_id")
    fitness_goal = body.get("fitness_goal")
    exercises = body.get("exercises", [])
    if not user_id or not fitness_goal:
        return jsonify({"error": "user_id and fitness_goal are required"}), 400
    workout = Workout(user_id=user_id, fitness_goal=fitness_goal, date=date.today())
    db.session.add(workout)
    db.session.flush()
    for ex in exercises:
        exercise = WorkoutExercise(
            workout_id=workout.id,
            name=ex.get("name"),
            muscle=ex.get("muscle"),
            image_url=ex.get("image_url"),
            is_completed=ex.get("is_completed", False)
        )
        db.session.add(exercise)
    db.session.commit()
    return jsonify(workout.serialize()), 201 