from flask import request, jsonify, Blueprint
from api.models import db, User, ProgressPhoto, FavoriteMeal, ExerciseLog, ProgressLog, NutritionLog, FoodLog
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
import cloudinary
import cloudinary.uploader
import os
import requests
import random
from datetime import date
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google import genai
import json
from api.common_foods import COMMON_FOODS
import re
import resend
from api.models import FavoriteMeal

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

api = Blueprint('api', __name__)
CORS(api)

motivations = {
    "great": ["You're unstoppable today!", "Push your limits today!"],
    "good": ["Stay consistent and trust the process.", "Small progress is still progress."],
    "okay": ["Showing up matters more than perfection.", "Keep moving forward one step at a time."],
    "tired": ["Recovery is part of growth.", "Take care of your body today."],
    "low": ["You are stronger than you think.", "Even difficult days help you grow."]
}

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

resend.api_key = os.getenv("RESEND_API_KEY")

FRONTEND_URL = os.getenv("FRONTEND_URL")


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend"}), 200


@api.route("/test-email", methods=["GET"])
def test_email():
    try:
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": ["meylin103@gmail.com"],
            "subject": "GymMind Test Email",
            "html": "<h1>Hello from GymMind!</h1><p>Your Resend integration is working.</p>"
        })

        return jsonify({
            "message": "Email sent",
            "response": response
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


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
    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        "message": "User created successfully",
        "token": access_token,
        "user": new_user.serialize()
    }), 201


@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not user.check_password(data.get("password")):
        return jsonify({"msg": "Invalid email or password"}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"token": access_token, "user": user.serialize()}), 200
@api.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Email not found"}), 404

    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [email],
            "subject": "GymMind AI - Reset Your Password",
            "html": f"""
            <div style="
                background:#050b12;
                padding:40px 20px;
                font-family:Arial,sans-serif;
            ">

                <div style="
                    max-width:600px;
                    margin:auto;
                    background:#0a1118;
                    border:1px solid #00d9ff;
                    border-radius:16px;
                    padding:40px;
                    box-shadow:0 0 20px rgba(0,217,255,0.15);
                ">

                    <div style="text-align:center;">

                        <h1 style="
                            color:#00d9ff;
                            font-size:42px;
                            letter-spacing:4px;
                            margin-bottom:10px;
                        ">
                            GYMMIND AI
                        </h1>

                        <div style="
                            width:120px;
                            height:3px;
                            background:#00d9ff;
                            margin:0 auto 30px auto;
                            border-radius:4px;
                        "></div>

                        <h2 style="
                            color:white;
                            font-size:34px;
                            letter-spacing:2px;
                            margin-bottom:30px;
                        ">
                            RESET YOUR PASSWORD
                        </h2>

                    </div>

                    <p style="
                        color:#d1d5db;
                        font-size:18px;
                        margin-bottom:20px;
                    ">
                        Hello <strong style="color:#00d9ff;">{user.first_name}</strong>,
                    </p>

                    <p style="
                        color:#b6c2cf;
                        font-size:16px;
                        line-height:1.7;
                    ">
                        We received a request to reset the password for your GymMind account.
                    </p>

                    <p style="
                        color:#b6c2cf;
                        font-size:16px;
                        line-height:1.7;
                    ">
                        Click the button below to create a new password and continue your fitness journey.
                    </p>

                    <div style="text-align:center;margin:40px 0;">

                        <a
                            href="{FRONTEND_URL}/reset-password"
                            style="
                                background:#00d9ff;
                                color:#041018;
                                padding:18px 36px;
                                border-radius:10px;
                                text-decoration:none;
                                font-size:18px;
                                font-weight:700;
                                letter-spacing:1px;
                                display:inline-block;
                            "
                        >
                            RESET PASSWORD
                        </a>

                    </div>

                    <div style="
                        border-top:1px solid #1f2937;
                        padding-top:25px;
                    ">

                        <p style="
                            color:#94a3b8;
                            text-align:center;
                            line-height:1.7;
                        ">
                            If you didn't request this password reset,
                            you can safely ignore this email.
                        </p>

                        <p style="
                            color:#00d9ff;
                            text-align:center;
                            margin-top:25px;
                            letter-spacing:1px;
                        ">
                            Your Mind. Your Body. Your Evolution.
                        </p>

                    </div>

                </div>

            </div>
            """
        })

        return jsonify({
            "message": "Password reset email sent"
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@api.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    user.set_password(password)
    db.session.commit()

    return jsonify({
        "message": "Password updated successfully"
    }), 200


@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200


@api.route('/nutrition/recommendations', methods=['POST'])
def get_nutrition_recommendations():
    body = request.get_json()
    goal = body.get("goal")
    if not goal:
        return jsonify({"error": "Goal is required"}), 400
    recommendations = {
        "fat_loss": {"calories": 1800, "protein": 160, "carbs": 180, "fats": 55, "message": "Focus on high protein and a calorie deficit."},
        "muscle_gain": {"calories": 2500, "protein": 190, "carbs": 300, "fats": 70, "message": "Focus on a calorie surplus and strength training."},
        "recomposition": {"calories": 2100, "protein": 175, "carbs": 220, "fats": 60, "message": "Balance calories and prioritize protein intake."}
    }
    if goal not in recommendations:
        return jsonify({"error": "Invalid goal"}), 400
    return jsonify(recommendations[goal]), 200


@api.route("/nutrition/search", methods=["POST"])
def search_food():
    body = request.get_json()
    food = body.get("food", "").lower().strip()
    if not food:
        return jsonify({"error": "Food is required"}), 400
    quantity_match = re.match(r"^(\d+)", food)
    quantity = int(quantity_match.group(1)) if quantity_match else 1
    clean_food = re.sub(r"^\d+\s*", "", food).strip()
    for key, item in COMMON_FOODS.items():
        if key in clean_food:
            return jsonify({
                "name": f"{quantity} {item['name']}",
                "category": item.get("category"),
                "serving": item.get("serving"),
                "calories": round(item["calories"] * quantity, 2),
                "protein": round(item["protein"] * quantity, 2),
                "carbs": round(item["carbs"] * quantity, 2),
                "fats": round(item["fats"] * quantity, 2),
                "source": "GymMind verified food database"
            }), 200
    api_key = os.getenv("USDA_API_KEY")
    response = requests.get(
        "https://api.nal.usda.gov/fdc/v1/foods/search",
        params={"api_key": api_key, "query": clean_food, "pageSize": 5}
    )
    data = response.json()
    if "foods" not in data or len(data["foods"]) == 0:
        return jsonify({"error": "Food not found"}), 404
    foods = data["foods"]
    search_terms = clean_food.lower().split()
    food_item = next(
        (item for item in foods if all(term.rstrip("s") in item.get(
            "description", "").lower() for term in search_terms)),
        None
    )
    if food_item is None:
        food_item = next(
            (item for item in foods if any(term.rstrip("s") in item.get(
                "description", "").lower() for term in search_terms)),
            foods[0]
        )
    nutrients = food_item["foodNutrients"]

    def nutrient(name):
        for item in nutrients:
            if item["nutrientName"] == name:
                return item.get("value", 0)
        return 0
    return jsonify({
        "name": food_item["description"],
        "calories": round(nutrient("Energy") * quantity, 2),
        "protein": round(nutrient("Protein") * quantity, 2),
        "carbs": round(nutrient("Carbohydrate, by difference") * quantity, 2),
        "fats": round(nutrient("Total lipid (fat)") * quantity, 2),
        "source": "USDA database",
        "category": "USDA Result",
        "serving": "Estimated standard serving"
    }), 200


@api.route("/healthy-meals", methods=["POST"])
def healthy_meals():
    body = request.get_json()
    query = body.get("query")
    if not query:
        return jsonify({"error": "Meal search is required"}), 400
    prompt = f"""
    You are a nutrition coach for a fitness app.
    Generate 5 healthy and flavorful meal recommendations based on this user request:
    {query}
    Rules:
    - Do not mention cuisine, nationality, culture, or country of origin.
    - Focus only on flavor, nutrition, macros, ingredients, and preparation.
    - Meals should be healthy, enjoyable, and tasty.
    - Include simple recipes.
    Return ONLY valid JSON with this structure:
    {{
        "meals": [
            {{
                "name": "string",
                "calories": "string",
                "protein": "string",
                "prep_time": "string",
                "flavor_profile": "string",
                "ingredients": ["string"],
                "instructions": ["string"],
                "why_healthy": "string"
            }}
        ]
    }}
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", contents=prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()
        return jsonify(json.loads(text)), 200
    except Exception as e:
        print("HEALTHY MEALS ERROR:", e)
        return jsonify({
            "meals": [{
                "name": "High Protein Steak Bowl",
                "calories": "520 kcal",
                "protein": "45g",
                "prep_time": "25 minutes",
                "flavor_profile": "Savory, smoky, fresh",
                "ingredients": ["6 oz lean steak", "1 cup cooked rice", "1/2 avocado", "mixed greens", "Greek yogurt sauce"],
                "instructions": ["Season and cook the steak.", "Prepare the rice.", "Slice the avocado.", "Add greens to a bowl.", "Top with steak, rice, avocado, and sauce."],
                "why_healthy": "High in protein, balanced with complex carbs and healthy fats."
            }],
            "fallback": True
        }), 200


@api.route("/food-log", methods=["POST"])
@jwt_required()
def add_food_log():
    user_id = int(get_jwt_identity())
    body = request.get_json()
    new_food = FoodLog(
        user_id=user_id,
        food_name=body.get("food_name"),
        calories=body.get("calories"),
        protein=body.get("protein"),
        carbs=body.get("carbs"),
        fats=body.get("fats"),
        category=body.get("category"),
        serving=body.get("serving"),
        source=body.get("source")
    )
    db.session.add(new_food)
    db.session.commit()
    return jsonify({"message": "Food added to log", "food": new_food.serialize()}), 201


@api.route("/food-log/today", methods=["GET"])
@jwt_required()
def get_today_food_log():
    from api.models import NutritionLog as FoodLog
    user_id = int(get_jwt_identity())
    today = date.today()
    foods = FoodLog.query.filter(
        FoodLog.user_id == user_id, db.func.date(FoodLog.date) == today).all()
    return jsonify({"foods": [food.serialize() for food in foods]}), 200


@api.route("/food-log/<int:food_id>", methods=["DELETE"])
@jwt_required()
def delete_food_log(food_id):
    user_id = int(get_jwt_identity())
    food = FoodLog.query.filter_by(id=food_id, user_id=user_id).first()
    if not food:
        return jsonify({"error": "Food not found"}), 404
    db.session.delete(food)
    db.session.commit()
    return jsonify({"message": "Food removed from log"}), 200


@api.route("/food-log/history", methods=["GET"])
@jwt_required()
def get_food_log_history():
    from api.models import NutritionLog as FoodLog
    user_id = int(get_jwt_identity())
    foods = FoodLog.query.filter_by(
        user_id=user_id).order_by(FoodLog.date.desc()).all()
    history = {}
    for food in foods:
        day = food.date.isoformat()
        if day not in history:
            history[day] = {"date": day, "foods": [], "totals": {
                "calories": 0, "protein": 0, "carbs": 0, "fats": 0}}
        history[day]["foods"].append(food.serialize())
        history[day]["totals"]["calories"] += food.calories
        history[day]["totals"]["protein"] += food.protein
        history[day]["totals"]["carbs"] += food.carbs
        history[day]["totals"]["fats"] += food.fats
    return jsonify({"history": list(history.values())}), 200


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
        file, folder="gymmind/avatars", public_id=f"user_{user_id}", overwrite=True, resource_type="image")
    user.photo_url = result.get("secure_url")
    db.session.commit()
    return jsonify({"message": "Photo uploaded successfully", "photo_url": user.photo_url}), 200


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


@api.route('/mood', methods=['POST'])
@jwt_required()
def add_mood():
    from api.models import MoodCheck
    current_user = int(get_jwt_identity())
    body = request.get_json()
    mood = body.get("mood")
    valid_moods = ["great", "good", "okay", "tired", "low"]
    if mood not in valid_moods:
        return jsonify({"error": "Invalid mood"}), 400
    today = date.today()
    todays_moods = MoodCheck.query.filter(
        MoodCheck.user_id == current_user, db.func.date(MoodCheck.date) == today).count()
    if todays_moods >= 3:
        return jsonify({"error": "Daily mood check limit reached"}), 400
    try:
        prompt = f"The user is feeling '{mood}' today. Give a short motivational fitness message. Keep it positive, supportive, and fitness-focused. Maximum 2 sentences."
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", contents=prompt)
        ai_message = response.text
    except Exception as e:
        print("Gemini error:", e)
        ai_message = random.choice(motivations[mood])
    recommendations = {
        "great": {"training_intensity": "High", "recommended_focus": "Strength & PR Training"},
        "good": {"training_intensity": "Medium-High", "recommended_focus": "Balanced Workout"},
        "okay": {"training_intensity": "Medium", "recommended_focus": "Consistency Training"},
        "tired": {"training_intensity": "Low", "recommended_focus": "Recovery & Stretching"},
        "low": {"training_intensity": "Low", "recommended_focus": "Light Movement & Motivation"}
    }
    mood_check = MoodCheck(user_id=current_user, mood=mood,
                           ai_message=ai_message, date=today)
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
        user_id=user_id).order_by(MoodCheck.date.desc()).all()
    return jsonify([m.serialize() for m in moods]), 200


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
            workout_id=workout.id, name=ex.get("name"), muscle=ex.get("muscle"),
            image_url=ex.get("image_url"), is_completed=ex.get("is_completed", False)
        )
        db.session.add(exercise)
    db.session.commit()
    return jsonify(workout.serialize()), 201


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
            model="gemini-2.5-flash-lite", contents=f"{system_prompt}\n\nUser: {message}")
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
            credential, google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
        email = google_user.get("email")
        first_name = google_user.get("given_name", "")
        last_name = google_user.get("family_name", "")
        if not email:
            return jsonify({"error": "Google account email not found"}), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(first_name=first_name, last_name=last_name,
                        email=email, is_active=True)
            user.set_password("google-oauth-user")
            db.session.add(user)
            db.session.commit()
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"token": access_token, "user": user.serialize()}), 200
    except Exception as error:
        print(error)
        return jsonify({"error": "Invalid Google credential"}), 401


@api.route('/youtube/search', methods=['GET'])
@jwt_required()
def search_youtube():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Query is required"}), 400
    youtube_api_key = os.getenv("YOUTUBE_API_KEY")
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet,contentDetails",
        "q": f"how to do {query} exercise form",
        "type": "video",
        "maxResults": 1,
        "videoEmbeddable": "true",
        "key": youtube_api_key
    }
    response = requests.get(url, params=params)
    data = response.json()
    if "items" in data and len(data["items"]) > 0:
        video_id = data["items"][0]["id"]["videoId"]
        return jsonify({"video_id": video_id}), 200
    return jsonify({"error": "No video found"}), 404


@api.route('/workout/generate', methods=['POST'])
@jwt_required()
def generate_workout():
    body = request.get_json()
    fitness_goal = body.get("fitness_goal")
    user_id = body.get("user_id")
    muscle_group = body.get("muscle_group", "full body")
    difficulty_preference = body.get("difficulty_preference")

    if not fitness_goal or not user_id:
        return jsonify({"error": "fitness_goal and user_id are required"}), 400

    difficulty_note = ""
    if difficulty_preference == "easy":
        difficulty_note = "\nIMPORTANT: The user found the last routine too easy. Generate a MORE CHALLENGING version with heavier weights, more sets, or more demanding exercises."
    elif difficulty_preference == "hard":
        difficulty_note = "\nIMPORTANT: The user found the last routine too hard. Generate a LIGHTER version with fewer sets, lighter exercises, or more beginner-friendly movements."

    try:
        prompt = f"""You are a professional fitness coach. Generate a workout routine for someone with the goal: {fitness_goal} focusing on muscle group: {muscle_group}.

Return ONLY a valid JSON object with this exact structure, no extra text:
{{
    "workout_name": "string",
    "description": "string",
    "muscle_group": "{muscle_group}",
    "exercises": [
        {{"name": "string", "muscle": "string", "equipment": "machine or free weight",
            "sets": number, "reps": number, "instructions": "string"}}
    ]
}}

Generate 5-6 exercises. Use real gym exercises with specific names like:
- For chest: Barbell bench press, Incline dumbbell press, Pec deck machine, Cable crossover, Dips
- For back: Lat pulldown, Barbell row, Pull-ups, Seated cable row, Deadlift
- For shoulders: Military press, Dumbbell lateral raise, Face pulls, Arnold press, Front raise
- For biceps: Barbell curl, Hammer curl, Concentration curl, Preacher curl
- For triceps: Tricep pushdown, Skull crushers, Overhead tricep extension, Dips
- For legs: Barbell squat, Leg press, Romanian deadlift, Leg curl, Leg extension
- For glutes: Hip thrust, Bulgarian split squat, Cable kickback, Glute bridge
- For core: Plank, Cable crunch, Hanging leg raise, Russian twist
Mix machines and free weights. Keep exercise names specific and searchable on YouTube.
All text must be in English only. No Spanish words.{difficulty_note}"""

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", contents=prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        workout_data = json.loads(text)
        return jsonify(workout_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/favorite-meals", methods=["POST"])
@jwt_required()
def add_favorite_meal():
    user_id = int(get_jwt_identity())
    body = request.get_json()
    meal = FavoriteMeal(
        user_id=user_id,
        meal_name=body.get("meal_name"),
        calories=body.get("calories"),
        protein=body.get("protein"),
        carbs=body.get("carbs"),
        fats=body.get("fats")
    )
    db.session.add(meal)
    db.session.commit()
    return jsonify(meal.serialize()), 201


@api.route("/favorite-meals", methods=["GET"])
@jwt_required()
def get_favorite_meals():
    user_id = int(get_jwt_identity())
    meals = FavoriteMeal.query.filter_by(user_id=user_id).all()
    return jsonify([meal.serialize() for meal in meals]), 200


@api.route("/favorite-meals/<int:meal_id>", methods=["DELETE"])
@jwt_required()
def delete_favorite_meal(meal_id):
    user_id = int(get_jwt_identity())
    meal = FavoriteMeal.query.filter_by(id=meal_id, user_id=user_id).first()
    if not meal:
        return jsonify({"error": "Meal not found"}), 404
    db.session.delete(meal)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@api.route('/exercise-log', methods=['POST'])
@jwt_required()
def add_exercise_log():
    from api.models import ExerciseLog
    current_user = int(get_jwt_identity())
    body = request.get_json()
    exercise_name = body.get("exercise_name")
    weight = body.get("weight")
    sets = body.get("sets")
    reps = body.get("reps")
    difficulty = body.get("difficulty")
    if not all([exercise_name, weight, sets, reps, difficulty]):
        return jsonify({"error": "All fields are required"}), 400
    log = ExerciseLog(
        user_id=current_user,
        exercise_name=exercise_name,
        weight=weight,
        sets=sets,
        reps=reps,
        difficulty=difficulty,
        date=date.today()
    )
    db.session.add(log)
    db.session.commit()
    return jsonify(log.serialize()), 201


@api.route('/exercise-log/<string:exercise_name>', methods=['GET'])
@jwt_required()
def get_exercise_logs(exercise_name):
    from api.models import ExerciseLog
    current_user = int(get_jwt_identity())
    logs = ExerciseLog.query.filter_by(user_id=current_user, exercise_name=exercise_name).order_by(
        ExerciseLog.date.desc()).limit(5).all()
    return jsonify([log.serialize() for log in logs]), 200


@api.route('/exercise-log/recommend', methods=['POST'])
@jwt_required()
def recommend_weight():
    from api.models import ExerciseLog
    current_user = int(get_jwt_identity())
    body = request.get_json()
    exercise_name = body.get("exercise_name")
    if not exercise_name:
        return jsonify({"error": "exercise_name is required"}), 400
    logs = ExerciseLog.query.filter_by(
        user_id=current_user,
        exercise_name=exercise_name
    ).order_by(ExerciseLog.date.desc()).limit(5).all()
    if not logs:
        return jsonify({"recommendation": f"Start with a comfortable weight for {exercise_name} and focus on form first."}), 200
    history = "\n".join([
        f"- Date: {log.date}, Weight: {log.weight}kg, Sets: {log.sets}, Reps: {log.reps}, Difficulty: {log.difficulty}"
        for log in logs
    ])
    prompt = f"""Based on this exercise history for {exercise_name}:
{history}

Give a short recommendation for the next workout weight. Be specific with the kg amount. Maximum 2 sentences."""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", contents=prompt)
        return jsonify({"recommendation": response.text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/workout/recommend', methods=['GET'])
@jwt_required()
def recommend_workout():
    from api.models import ExerciseLog, Workout
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    from datetime import timedelta
    week_ago = date.today() - timedelta(days=7)
    recent_workouts = Workout.query.filter(
        Workout.user_id == current_user_id,
        Workout.date >= week_ago
    ).order_by(Workout.date.desc()).all()
    recent_logs = ExerciseLog.query.filter(
        ExerciseLog.user_id == current_user_id,
        ExerciseLog.date >= week_ago
    ).order_by(ExerciseLog.date.desc()).all()
    history = ""
    if recent_logs:
        history = "\n".join([
            f"- {log.date}: {log.exercise_name} ({log.weight}kg, difficulty: {log.difficulty})"
            for log in recent_logs[:15]
        ])
    age = None
    if user.date_of_birth:
        from datetime import datetime
        birth = datetime.strptime(user.date_of_birth, "%Y-%m-%d")
        age = (datetime.now() - birth).days // 365
    prompt = f"""You are a professional fitness coach. Based on this user's profile and recent training history, recommend which muscle group they should train today.

User profile:
- Gender: {user.gender or "not specified"}
- Age: {age or "not specified"}
- Weight: {user.weight or "not specified"} kg
- Height: {user.height or "not specified"} cm
- Fitness goal: {user.fitness_goal or "general fitness"}

Recent training history (last 7 days):
{history if history else "No recent workouts - this is their first session"}

Available muscle groups: Chest, Back, Shoulders, Biceps, Triceps, Legs, Glutes, Core, Full Body

Return ONLY a valid JSON object:
{{
    "recommended_group": "string (one of the available groups)",
    "reason": "string (2-3 sentences explaining why, considering rest days and muscle recovery)"
}}"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", contents=prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        data = json.loads(text)
        return jsonify(data), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── PROGRESS PHOTOS ──────────────────────────────────────────────────────────

@api.route('/user/<int:user_id>/progress-photo', methods=['POST'])
@jwt_required()
def upload_progress_photo(user_id):
    from datetime import date as date_type
    existing = ProgressPhoto.query.filter(
        ProgressPhoto.user_id == user_id,
        db.func.date(ProgressPhoto.taken_at) == date_type.today()
    ).first()
    if existing:
        return jsonify({"error": "You already uploaded a photo today"}), 400

    file = request.files.get('photo')
    notes = request.form.get('notes', '')
    if not file:
        return jsonify({"error": "No photo provided"}), 400

    try:
        upload_result = cloudinary.uploader.upload(
            file, folder=f"gymmind/progress/{user_id}")
        photo_url = upload_result.get('secure_url')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    new_photo = ProgressPhoto(
        user_id=user_id, photo_url=photo_url, notes=notes)
    db.session.add(new_photo)
    db.session.commit()
    return jsonify(new_photo.serialize()), 201


@api.route('/user/<int:user_id>/progress-photos', methods=['GET'])
@jwt_required()
def get_progress_photos(user_id):
    photos = ProgressPhoto.query.filter_by(user_id=user_id)\
        .order_by(ProgressPhoto.taken_at.desc()).all()
    return jsonify([p.serialize() for p in photos]), 200


@api.route('/exercise-log/date/<string:date>', methods=['GET'])
@jwt_required()
def get_exercise_logs_by_date(date):
    from api.models import ExerciseLog
    current_user = int(get_jwt_identity())
    logs = ExerciseLog.query.filter_by(user_id=current_user, date=date).all()
    return jsonify([log.serialize() for log in logs]), 200


@api.route('/dashboard/message', methods=['GET'])
@jwt_required()
def dashboard_message():
    from api.models import ProgressLog, MoodCheck, Workout
    from datetime import timedelta
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    week_ago = date.today() - timedelta(days=7)

    workouts = Workout.query.filter(
        Workout.user_id == current_user_id,
        Workout.date >= week_ago
    ).all()

    last_mood = MoodCheck.query.filter_by(
        user_id=current_user_id
    ).order_by(MoodCheck.date.desc()).first()

    logs = ProgressLog.query.filter_by(
        user_id=current_user_id
    ).order_by(ProgressLog.date.desc()).limit(2).all()

    weight_change = None
    if len(logs) >= 2:
        weight_change = round(logs[0].weight - logs[1].weight, 1)

    prompt = f"""You are GymMind AI Coach. Generate a short, personalized motivational message for this user.

User: {user.first_name}, goal: {user.fitness_goal or 'general fitness'}
This week: {len(workouts)} workouts
Last mood: {last_mood.mood if last_mood else 'unknown'}
Weight change: {f'{weight_change:+.1f} kg' if weight_change is not None else 'no data'}

Write 1-2 sentences. Be specific, energetic, and personal. Use their name. In English only."""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return jsonify({"message": response.text}), 200
    except Exception as e:
        return jsonify({"message": f"Keep pushing, {user.first_name}! Every workout counts."}), 200

@api.route('/badges/<int:user_id>', methods=['GET'])
@jwt_required()
def get_badges(user_id):
    from api.models import Workout, ExerciseLog
    from datetime import timedelta

    workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.date.desc()).all()
    logs = ExerciseLog.query.filter_by(user_id=user_id).all()

    total_workouts = len(workouts)
    total_volume = sum(l.weight * l.sets * l.reps for l in logs if l.weight)

    # Streak
    streak = 0
    if workouts:
        sorted_dates = sorted(set(w.date for w in workouts), reverse=True)
        check_date = date.today()
        for d in sorted_dates:
            if (check_date - d).days <= 1:
                streak += 1
                check_date = d - timedelta(days=1)
            else:
                break

    badges = []

    if total_workouts >= 1:
        badges.append({"id": "first_workout", "name": "First Workout", "icon": "🥉", "description": "Completed your first workout"})
    if total_workouts >= 5:
        badges.append({"id": "five_workouts", "name": "5 Workouts", "icon": "🥈", "description": "Completed 5 workouts"})
    if total_workouts >= 10:
        badges.append({"id": "ten_workouts", "name": "10 Workouts", "icon": "🥇", "description": "Completed 10 workouts"})
    if streak >= 3:
        badges.append({"id": "streak_3", "name": "3 Day Streak", "icon": "🔥", "description": "Trained 3 days in a row"})
    if streak >= 7:
        badges.append({"id": "streak_7", "name": "7 Day Streak", "icon": "⚡", "description": "Trained 7 days in a row"})
    if total_volume >= 1000:
        badges.append({"id": "volume_1k", "name": "1,000 kg Club", "icon": "💪", "description": "Lifted 1,000 kg total"})
    if total_volume >= 10000:
        badges.append({"id": "volume_10k", "name": "10,000 kg Club", "icon": "🏆", "description": "Lifted 10,000 kg total"})

    return jsonify({
        "badges": badges,
        "stats": {
            "total_workouts": total_workouts,
            "total_volume": round(total_volume),
            "streak": streak
        }
    }), 200
