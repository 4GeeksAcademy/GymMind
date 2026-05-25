import React, { useEffect, useState } from "react";

export const Nutrition = () => {
    const [nutritionData, setNutritionData] = useState(null);
    const [goal, setGoal] = useState("muscle_gain");
    const [foodSearch, setFoodSearch] = useState("");
    const [foodResults, setFoodResults] = useState([]);

    useEffect(() => {
        fetchNutrition();
    }, [goal]);

    const fetchNutrition = async () => {
        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL +
                "/api/nutrition/recommendations",
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
                import.meta.env.VITE_BACKEND_URL +
                "/api/nutrition/search",
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

        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteFood = (index) => {

        const updatedFoods =
            foodResults.filter(
                (_, i) => i !== index
            );

        setFoodResults(updatedFoods);
    };

    const totalCalories =
        foodResults.reduce(
            (total, food) =>
                total + food.calories,
            0
        );

    const totalProtein =
        foodResults.reduce(
            (total, food) =>
                total + food.protein,
            0
        );

    const totalCarbs =
        foodResults.reduce(
            (total, food) =>
                total + food.carbs,
            0
        );

    const totalFats =
        foodResults.reduce(
            (total, food) =>
                total + food.fats,
            0
        );

    return (
        <div className="nutrition-page">

            <div className="nutrition-container">

                <select
                    value={goal}
                    onChange={(e) =>
                        setGoal(e.target.value)
                    }
                >

                    <option value="muscle_gain">
                        Muscle Gain
                    </option>

                    <option value="fat_loss">
                        Fat Loss
                    </option>

                    <option value="recomposition">
                        Recomposition
                    </option>

                </select>

                {nutritionData && (

                    <>

                        <div className="nutrition-summary">

                            <h2>
                                🤖 AI COACH — NUTRITION
                            </h2>

                            <p>
                                {nutritionData.message}
                            </p>

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
                            <small>Target: {nutritionData.calories.toLocaleString()} kcal</small>
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
                                        (totalCalories / nutritionData.calories) * 100,
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
                                        (totalCalories / nutritionData.calories) * 100,
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
                                        (totalCalories / nutritionData.calories) * 100,
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

                        <h2>
                            🔍 SEARCH FOOD
                        </h2>

                        <div className="search-bar">

                            <input
                                type="text"
                                placeholder="Search food..."
                                value={foodSearch}
                                onChange={(e) =>
                                    setFoodSearch(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                className="search-btn"
                                onClick={handleSearch}
                            >
                                Search
                            </button>

                        </div>

                    </div>

                    <div className="food-log">

                        <h2>
                            📋 TODAY'S FOOD LOG
                        </h2>

                        {
                            foodResults.map(
                                (food, index) => (

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

                                        </div>

                                        <div className="food-actions">

                                            <span>
                                                {food.calories}
                                                kcal
                                            </span>

                                            <button
                                                className="delete-food-btn"
                                                onClick={() =>
                                                    handleDeleteFood(index)
                                                }
                                            >

                                                ✕

                                            </button>

                                        </div>

                                    </div>

                                )
                            )
                        }

                        <div className="food-total">

                            <h3>
                                Daily Total
                            </h3>

                            <p>
                                🔥 {totalCalories} kcal
                            </p>

                            <p>
                                💪 {totalProtein}g
                            </p>

                            <p>
                                🍚 {totalCarbs}g
                            </p>

                            <p>
                                🥑 {totalFats}g
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};