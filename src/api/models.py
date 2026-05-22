from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
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
            # do not serialize the password, its a security breach
        }


class Nutrition(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    goal: Mapped[str] = mapped_column(
        String(80),
        nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )
    title: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )
    description: Mapped[str] = mapped_column(
        nullable=False
    )
    calories: Mapped[int] = mapped_column(
        nullable=True
    )
    protein: Mapped[int] = mapped_column(
        nullable=True
    )
    carbs: Mapped[int] = mapped_column(
        nullable=True
    )
    fats: Mapped[int] = mapped_column(
        nullable=True
    )

    def serialize(self):
        return {
            "id": self.id,
            "goal": self.goal,
            "category": self.goal,
            "title": self.category,
            "description": self.descrition,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fats": self.fats
        }
