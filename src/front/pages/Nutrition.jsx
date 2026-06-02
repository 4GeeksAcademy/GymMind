import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Nutrition = () => {
    const navigate = useNavigate();

    const [nutritionData, setNutritionData] = useState(null);
    const [goal, setGoal] = useState("muscle_gain");

    const [foodSearch, setFoodSearch] = useState("");
    const [foodResults, setFoodResults] = useState([]);

    const [mealIdea, setMealIdea] = useState("");
    const [mealResults, setMealResults] = useState([]);

    useEffect(() => {
        fetchNutrition();
    }, [goal]);

    const fetchNutrition = async () => {
        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/nutrition/recommendations",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ goal })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setNutritionData(data);
            }

        } catch (error) {
            console.log(error);
        }
    };

    const handleSearch = async () => {
        if (!foodSearch.trim()) return;

        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/nutrition/search",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        food: foodSearch
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setFoodResults([
                    ...foodResults,
                    data
                ]);

                setFoodSearch("");
            }
            console.log(data);

        } catch (error) {
            console.log(error);
        }
    };

    const handleMealIdeas = async () => {
        if (!mealIdea.trim()) return;

        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/healthy-meals",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        query: mealIdea
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMealResults(data.meals || []);
                setMealIdea("");
            }

        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteFood = (index) => {
        const updatedFoods = foodResults.filter(
            (_, i) => i !== index
        );

        setFoodResults(updatedFoods);
    };

    const totalCalories = foodResults.reduce(
        (total, food) => total + food.calories,
        0
    );

    const totalProtein = foodResults.reduce(
        (total, food) => total + food.protein,
        0
    );

    const totalCarbs = foodResults.reduce(
        (total, food) => total + food.carbs,
        0
    );

    const totalFats = foodResults.reduce(
        (total, food) => total + food.fats,
        0
    );

    return (
        <div className="nutrition-page">
            <nav className="nutrition-navbar">
                <div className="nutrition-navbar-left">
                    <div className="nutrition-logo">GYMMIND AI</div>

                    <div className="nutrition-navbar-links">
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/workout">My Workout</Link>
                        <Link to="/moodcheck">Mood Check</Link>
                        <Link to="/progress">Progress</Link>
                        <Link to="/nutrition" className="active">Nutrition</Link>
                        <Link to="/profile">Profile</Link>
                    </div>
                </div>

                <div className="nutrition-navbar-actions">
                    <button
                        className="nutrition-signout-btn"
                        onClick={() => {
                            sessionStorage.removeItem("token");
                            sessionStorage.removeItem("user");
                            navigate("/login");
                        }}
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            <div className="nutrition-container">
                <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                >
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="recomposition">Recomposition</option>
                </select>

                {nutritionData && (
                    <>
                        <div className="nutrition-summary">
                            <h2>🤖 AI COACH — NUTRITION</h2>

                            <p>{nutritionData.message}</p>

                            <div className="macro-tags">
                                <div className="macro-tag">
                                    🔥 {nutritionData.calories} kcal
                                </div>

                                <div className="macro-tag">
                                    💪 {nutritionData.protein}g
                                </div>

                                <div className="macro-tag">
                                    🍚 {nutritionData.carbs}g
                                </div>

                                <div className="macro-tag">
                                    🥑 {nutritionData.fats}g
                                </div>
                            </div>
                        </div>

                        <div className="nutrition-grid">
                            <div className="nutrition-card calories-card">
                                <h2>🔥</h2>
                                <h1>{totalCalories.toLocaleString()}</h1>
                                <p>Calories today</p>

                                <div className="progress-line">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(
                                                (totalCalories / nutritionData.calories) * 100,
                                                100
                                            )}%`
                                        }}
                                    />
                                </div>

                                <small>
                                    Target: {nutritionData.calories.toLocaleString()} kcal
                                </small>
                            </div>

                            <div className="nutrition-card protein-card">
                                <h2>💪</h2>
                                <h1>{totalProtein.toFixed(1)}G</h1>
                                <p>Protein</p>

                                <div className="progress-line">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(
                                                (totalProtein / nutritionData.protein) * 100,
                                                100
                                            )}%`
                                        }}
                                    />
                                </div>

                                <small>Target: {nutritionData.protein}g</small>
                            </div>

                            <div className="nutrition-card carbs-card">
                                <h2>🍚</h2>
                                <h1>{totalCarbs.toFixed(1)}G</h1>
                                <p>Carbs</p>

                                <div className="progress-line">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(
                                                (totalCarbs / nutritionData.carbs) * 100,
                                                100
                                            )}%`
                                        }}
                                    />
                                </div>

                                <small>Target: {nutritionData.carbs}g</small>
                            </div>

                            <div className="nutrition-card fats-card">
                                <h2>🥑</h2>
                                <h1>{totalFats.toFixed(1)}G</h1>
                                <p>Fats</p>

                                <div className="progress-line">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(
                                                (totalFats / nutritionData.fats) * 100,
                                                100
                                            )}%`
                                        }}
                                    />
                                </div>

                                <small>Target: {nutritionData.fats}g</small>
                            </div>
                        </div>
                    </>
                )}

                <div className="food-layout">
                    <div className="food-search">
                        <h2>🔍 SEARCH FOOD</h2>
                        <small className="food-search-hint">
                            For better accuracy, include quantity. Example: 2 eggs, 1 cup rice, 6 oz chicken.
                        </small>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Example: 2 fried eggs, 1 cup rice, 6 oz chicken"
                                value={foodSearch}
                                onChange={(e) => setFoodSearch(e.target.value)}
                            />

                            <button
                                className="search-btn"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>

                        <div className="nutrition-divider"></div>

                        <div className="meal-ideas">
                            <h2>✨ HEALTHY MEAL IDEAS</h2>

                            <p className="meal-ideas-description">
                                Search for healthy, flavorful meals with simple recipes.
                            </p>

                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Example: high protein dinner under 30 minutes"
                                    value={mealIdea}
                                    onChange={(e) => setMealIdea(e.target.value)}
                                />

                                <button
                                    className="search-btn"
                                    onClick={handleMealIdeas}
                                >
                                    Get Ideas
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="food-log">
                        <h2>📋 TODAY'S FOOD LOG</h2>

                        {foodResults.map((food, index) => (
                            <div
                                key={index}
                                className="food-log-item"
                            >
                                <div>
                                    <div className="food-name">
                                        {food.name}
                                    </div>

                                    <div className="food-macros">
                                        💪 {food.protein}g
                                        🍚 {food.carbs}g
                                        🥑 {food.fats}g
                                    </div>
                                    <div className="food-source">
                                    {food.category && <span>{food.category}</span>}
                                    {food.serving && <span> · {food.serving}</span>}
                                    {food.source && <span> · {food.source}</span>}
                                </div>
                                </div>

                                <div className="food-actions">
                                    <span>
                                        {food.calories} kcal
                                    </span>

                                    <button
                                        className="delete-food-btn"
                                        onClick={() => handleDeleteFood(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="food-total">
                            <h3>Daily Total</h3>
                            <p>🔥 {totalCalories} kcal</p>
                            <p>💪 {totalProtein}g</p>
                            <p>🍚 {totalCarbs}g</p>
                            <p>🥑 {totalFats}g</p>
                        </div>
                    </div>
                </div>

                {mealResults.length > 0 && (
                    <div className="meal-results-section">
                        <h2>🍽️ RECIPE IDEAS</h2>

                        <div className="meal-results-grid">
                            {mealResults.map((meal, index) => (
                                <div
                                    key={index}
                                    className="meal-card"
                                >
                                    <h3>{meal.name}</h3>

                                    <div className="meal-info">
                                        <span>🔥 {meal.calories}</span>
                                        <span>💪 {meal.protein}</span>
                                        <span>⏱️ {meal.prep_time}</span>
                                    </div>

                                    <p>
                                        <strong>Flavor:</strong> {meal.flavor_profile}
                                    </p>

                                    <p>
                                        <strong>Why healthy:</strong> {meal.why_healthy}
                                    </p>

                                    <h4>Ingredients</h4>

                                    <ul>
                                        {meal.ingredients?.map((ingredient, i) => (
                                            <li key={i}>{ingredient}</li>
                                        ))}
                                    </ul>

                                    <h4>Recipe</h4>

                                    <ol>
                                        {meal.instructions?.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};