from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Float, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)
    nickname: Mapped[str] = mapped_column(String(80), nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[str] = mapped_column(String(20), nullable=True)
    weight: Mapped[float] = mapped_column(Float, nullable=True)
    height: Mapped[float] = mapped_column(Float, nullable=True)
    phone_number: Mapped[str] = mapped_column(String(30), nullable=True)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    fitness_goal: Mapped[str] = mapped_column(String(50), nullable=True)

    # Relationships
    profile: Mapped["Profile"] = relationship(
        back_populates="user", uselist=False)
    workouts: Mapped[list["Workout"]] = relationship(back_populates="user")
    mood_checks: Mapped[list["MoodCheck"]
                        ] = relationship(back_populates="user")
    progress_logs: Mapped[list["ProgressLog"]
                          ] = relationship(back_populates="user")
    nutrition_logs: Mapped[list["NutritionLog"]
                           ] = relationship(back_populates="user")
    progress_photos: Mapped[list["ProgressPhoto"]
                            ] = relationship(back_populates="user")

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "nickname": self.nickname,
            "gender": self.gender,
            "date_of_birth": self.date_of_birth,
            "weight": self.weight,
            "height": self.height,
            "phone_number": self.phone_number,
            "photo_url": self.photo_url,
            "fitness_goal": self.fitness_goal,
        }


class Profile(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("user.id"), nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    height: Mapped[float] = mapped_column(Float, nullable=False)
    fitness_goal: Mapped[str] = mapped_column(String(50), nullable=False)
    photo_url: Mapped[str] = mapped_column(String(300), nullable=True)

    user: Mapped["User"] = relationship(back_populates="profile")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "age": self.age,
            "weight": self.weight,
            "height": self.height,
            "fitness_goal": self.fitness_goal,
            "photo_url": self.photo_url
        }


class Workout(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("user.id"), nullable=False)
    fitness_goal: Mapped[str] = mapped_column(String(50), nullable=False)
    date: Mapped[date] = mapped_column(
        Date, nullable=False, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="workouts")
    exercises: Mapped[list["WorkoutExercise"]
                      ] = relationship(back_populates="workout")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "fitness_goal": self.fitness_goal,
            "date": self.date.isoformat(),
            "exercises": [exercise.serialize() for exercise in self.exercises]
        }


class WorkoutExercise(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    workout_id: Mapped[int] = mapped_column(
        db.ForeignKey("workout.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    muscle: Mapped[str] = mapped_column(String(100), nullable=False)
    image_url: Mapped[str] = mapped_column(String(300), nullable=True)
    is_completed: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=False)

    workout: Mapped["Workout"] = relationship(back_populates="exercises")

    def serialize(self):
        return {
            "id": self.id,
            "workout_id": self.workout_id,
            "name": self.name,
            "muscle": self.muscle,
            "image_url": self.image_url,
            "is_completed": self.is_completed
        }


class MoodCheck(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("user.id"), nullable=False)
    mood: Mapped[str] = mapped_column(String(50), nullable=False)
    ai_message: Mapped[str] = mapped_column(Text, nullable=True)
    date: Mapped[date] = mapped_column(
        Date, nullable=False, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="mood_checks")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "mood": self.mood,
            "ai_message": self.ai_message,
            "date": self.date.isoformat()
        }


class ProgressLog(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("user.id"), nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[date] = mapped_column(
        Date, nullable=False, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="progress_logs")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "weight": self.weight,
            "date": self.date.isoformat()
        }


class NutritionLog(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("user.id"), nullable=False)
    food_name: Mapped[str] = mapped_column(String(200), nullable=False)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein: Mapped[float] = mapped_column(Float, nullable=False)
    carbs: Mapped[float] = mapped_column(Float, nullable=False)
    fats: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[date] = mapped_column(
        Date, nullable=False, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="nutrition_logs")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "food_name": self.food_name,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fats": self.fats,
            "date": self.date.isoformat()
        }


class ExerciseLog(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("user.id"), nullable=False)
    exercise_name: Mapped[str] = mapped_column(String(150), nullable=False)
    sets: Mapped[int] = mapped_column(nullable=False)
    reps: Mapped[int] = mapped_column(nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=True)
    date: Mapped[date] = mapped_column(
        Date, nullable=False, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "exercise_name": self.exercise_name,
            "sets": self.sets,
            "reps": self.reps,
            "weight": self.weight,
            "difficulty": self.difficulty,
            "date": self.date.isoformat()
        }


class ProgressPhoto(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("user.id"), nullable=False)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    notes: Mapped[str] = mapped_column(String(300), nullable=True)
    taken_at: Mapped[datetime] = mapped_column(
        nullable=False, default=datetime.utcnow)
    user: Mapped["User"] = relationship(back_populates="progress_photos")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "photo_url": self.photo_url,
            "notes": self.notes,
            "taken_at": self.taken_at.isoformat()
        }

class FoodLog(db.Model):
    __tablename__ = "food_log"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    food_name = db.Column(db.String(255), nullable=False)
    calories = db.Column(db.Float, nullable=False)
    protein = db.Column(db.Float, nullable=False)
    carbs = db.Column(db.Float, nullable=False)
    fats = db.Column(db.Float, nullable=False)

    category = db.Column(db.String(100))
    serving = db.Column(db.String(100))
    source = db.Column(db.String(100))

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "food_name": self.food_name,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fats": self.fats,
            "category": self.category,
            "serving": self.serving,
            "source": self.source,
            "created_at": self.created_at.isoformat()
        }


class FavoriteMeal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    meal_name = db.Column(db.String(255), nullable=False)
    calories = db.Column(db.Float)
    protein = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fats = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "meal_name": self.meal_name,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fats": self.fats
        }
