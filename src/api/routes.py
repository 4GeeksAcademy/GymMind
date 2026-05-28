from flask import request, jsonify, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash
import cloudinary
import cloudinary.uploader
import os
import requests
import random
from datetime import date
from google import genai 
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

api = Blueprint('api', __name__)
CORS(api)

# AI MOTIVATIONAL MESSAGES FOR MOOD CHECK
motivations = {
    "great": [
        "You're unstoppable today!",
        "Push your limits today!"
    ],

    "good": [
        "Stay consistent and trust the process.",
        "Small progress is still progress."
    ],

    "okay": [
        "Showing up matters more than perfection.",
        "Keep moving forward one step at a time."
    ],

    "tired": [
        "Recovery is part of growth.",
        "Take care of your body today."
    ],

    "low": [
        "You are stronger than you think.",
        "Even difficult days help you grow."
    ]
}


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
    new_user = User(first_name=first_name, last_name=last_name,
                    email=email, is_active=True)
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


def get_fitness_goals():
    goals = [
        {
            "id": "fat_loss",
            "name": "Fat Loss",
            "description": "Reduce body fat while maintaining muscle."
        },
        {
            "id": "muscle_gain",
            "name": "Muscle Gain",
            "description": "Build muscle with a calorie surplus."
        },
        {
            "id": "recomposition",
            "name": "Body Recomposition",
            "description": "Lose fat and gain muscle at the same time."
        }
    ]

    return jsonify(goals), 200


@api.route('/nutrition/recommendations', methods=['POST'])
def get_nutrition_recommendations():
    body = request.get_json()

    goal = body.get("goal")

    if not goal:
        return jsonify({"error": "Goal is required"}), 400

    recommendations = {
        "fat_loss": {
            "calories": 1800,
            "protein": 160,
            "carbs": 180,
            "fats": 55,
            "message": "Focus on high protein and a calorie deficit."
        },
        "muscle_gain": {
            "calories": 2500,
            "protein": 190,
            "carbs": 300,
            "fats": 70,
            "message": "Focus on a calorie surplus and strength training."
        },
        "recomposition": {
            "calories": 2100,
            "protein": 175,
            "carbs": 220,
            "fats": 60,
            "message": "Balance calories and prioritize protein intake."
        }
    }

    if goal not in recommendations:
        return jsonify({"error": "Invalid goal"}), 400

    return jsonify(recommendations[goal]), 200


# @api.route('/nutrition/tips/<goal>', methods=['GET'])
# def get_nutrition_tips(goal):
#     tips = Nutrition.query.filter_by(goal=goal).all()

#     return jsonify([tip.serialize() for tip in tips]), 200


@api.route("/nutrition/search", methods=["POST"])
def search_food():

    body = request.get_json()

    food = body.get("food")

    if not food:
        return jsonify({
            "error": "Food is required"
        }), 400

    api_key = os.getenv(
        "USDA_API_KEY"
    )

    response = requests.get(

        "https://api.nal.usda.gov/fdc/v1/foods/search",

        params={

            "api_key": api_key,

            "query": food,

            "pageSize": 1

        }

    )

    data = response.json()

    if len(data["foods"]) == 0:

        return jsonify({
            "error": "Food not found"
        }), 404

    food_item = data["foods"][0]

    nutrients = food_item["foodNutrients"]

    def nutrient(name):

        for item in nutrients:

            if item["nutrientName"] == name:

                return item.get(
                    "value",
                    0
                )

        return 0

    return jsonify({

        "name":
        food_item["description"],

        "calories":
        nutrient(
            "Energy"
        ),

        "protein":
        nutrient(
            "Protein"
        ),

        "carbs":
        nutrient(
            "Carbohydrate, by difference"
        ),

        "fats":
        nutrient(
            "Total lipid (fat)"
        )

    }), 200


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
    logs = ProgressLog.query.filter_by(
        user_id=user_id).order_by(ProgressLog.date.desc()).all()
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
    existing = ProgressLog.query.filter_by(
        user_id=user_id, date=date.today()).first()
    if existing:
        return jsonify({"error": "You already logged your weight today"}), 400
    log = ProgressLog(user_id=user_id, weight=weight, date=date.today())
    db.session.add(log)
    db.session.commit()
    return jsonify(log.serialize()), 201

# MOOD CHECK ENDPOINTS


@api.route('/mood', methods=['POST'])
@jwt_required()
def add_mood():
    from api.models import MoodCheck
    from datetime import date
    import random

    current_user = int(get_jwt_identity())
    body = request.get_json()

    mood = body.get("mood")

    valid_moods = ["great", "good", "okay", "tired", "low"]

    if mood not in valid_moods:
        return jsonify({"error": "Invalid mood"}), 400

    today = date.today()

    todays_moods = MoodCheck.query.filter(
        MoodCheck.user_id == current_user,
        db.func.date(MoodCheck.date) == today
    ).count()

    if todays_moods >= 3:
        return jsonify({"error": "Daily mood check limit reached"}), 400

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
        The user is feeling '{mood}' today.
        Give a short motivational fitness message.
        Keep it positive, supportive, and fitness-focused.
        Maximum 2 sentences.
        """

        response = model.generate_content(prompt)

        ai_message = response.text

    except Exception as e:
        print("Gemini error:", e)

        ai_message = random.choice(motivations[mood])

    recommendations = {
        "great": {
            "training_intensity": "High",
            "recommended_focus": "Strength & PR Training"
        },
        "good": {
            "training_intensity": "Medium-High",
            "recommended_focus": "Balanced Workout"
        },
        "okay": {
            "training_intensity": "Medium",
            "recommended_focus": "Consistency Training"
        },
        "tired": {
            "training_intensity": "Low",
            "recommended_focus": "Recovery & Stretching"
        },
        "low": {
            "training_intensity": "Low",
            "recommended_focus": "Light Movement & Motivation"
        }
    }

    mood_check = MoodCheck(
        user_id=current_user,
        mood=mood,
        ai_message=ai_message,
        date=today
    )

    db.session.add(mood_check)
    db.session.commit()

    return jsonify({
        "message": "Mood saved successfully",
        "mood_check": mood_check.serialize(),
        "training_intensity": recommendations[mood]["training_intensity"],
        "recommended_focus": recommendations[mood]["recommended_focus"]
    }), 201


@api.route('/mood', methods=['GET'])
@jwt_required()
def get_mood_history():
    from api.models import MoodCheck

    user_id = int(get_jwt_identity())

    moods = MoodCheck.query.filter_by(
        user_id=user_id
    ).order_by(MoodCheck.date.desc()).all()

    return jsonify([m.serialize() for m in moods]), 200


# WORKOUT ENDPOINTS


@api.route('/workout/<int:user_id>', methods=['GET'])
@jwt_required()
def get_workouts(user_id):
    from api.models import Workout
    workouts = Workout.query.filter_by(
        user_id=user_id).order_by(Workout.date.desc()).all()
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
    workout = Workout(
        user_id=user_id, fitness_goal=fitness_goal, date=date.today())
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

    import google.generativeai as genai


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY")) 


@api.route('/chat', methods=['POST'])
@jwt_required()
def chat_with_ai():
    body = request.get_json()
    message = body.get("message")
    context = body.get("context", "")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    try:
        system_prompt = f"""You are GymMind AI Coach, a personal fitness and wellness assistant. 
        You help users with workout advice, nutrition tips, motivation, and emotional support.
        Keep responses concise, friendly and motivational.
        {f'User context: {context}' if context else ''}"""

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=f"{system_prompt}\n\nUser: {message}"
        )

        return jsonify({"response": response.text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500 


@api.route("/google-login", methods=["POST"])
def google_login():
    body = request.get_json()
    credential = body.get("credential")

    if not credential:
        return jsonify({"error": "Google credential is required"}), 400

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = google_user.get("email")
        first_name = google_user.get("given_name", "")
        last_name = google_user.get("family_name", "")

        if not email:
            return jsonify({"error": "Google account email not found"}), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                is_active=True
            )
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "token": access_token,
            "user": user.serialize()
        }), 200

    except Exception as error:
        print(error)
        return jsonify({"error": "Invalid Google credential"}), 401   