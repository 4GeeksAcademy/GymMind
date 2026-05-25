"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def signup():
    body = request.get_json()

    first_name = body.get("first_name")
    last_name = body.get("last_name")
    email = body.get("email")
    password = body.get("password")

    if not first_name or not last_name or not email or not password:
        return jsonify({
            "error": "All fields are required"
        }), 400

    user_exists = User.query.filter_by(email=email).first()

    if user_exists:
        return jsonify({
            "error": "User already exists"
        }), 400

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        is_active=True
    )

    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User created successfully",
        "user": new_user.serialize()
    }), 201


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


@api.route('/nutrition/tips/<goal>', methods=['GET'])
def get_nutrition_tips(goal):
    tips = Nutrition.query.filter_by(goal=goal).all()

    return jsonify([tip.serialize() for tip in tips]), 200


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
