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
                    body: JSON.stringify({
                        goal: goal
                    })
                }
            );

            const data = await response.json();

            setNutritionData(data);

        } catch (error) {
            console.error(
                "Error fetching nutrition data:",
                error
            );
        }
    };

    const handleSearch = async () => {

        if (!foodSearch.trim()) {
            return;
        }

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

            const data =
                await response.json();


            if (response.ok) {

                setFoodResults([

                    ...foodResults,

                    data

                ]);

            }

            setFoodSearch("");

        }

        catch (error) {

            console.log(error);

        }

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
        <div>

            <h1>Nutrition</h1>

            <select
                value={goal}
                onChange={(event) =>
                    setGoal(event.target.value)
                }
            >
                <option value="muscle_gain">
                    Muscle Gain
                </option>

                <option value="fat_loss">
                    Fat Loss
                </option>

                <option value="recomposition">
                    Body Recomposition
                </option>
            </select>


            {nutritionData && (
                <>

                    <div className="nutrition-summary">

                        <h3>
                            🤖 AI COACH — NUTRITION RECOMMENDATION
                        </h3>

                        <p>
                            {nutritionData.message}
                        </p>

                        <div className="macro-tags">

                            <div>
                                🔥 {nutritionData.calories} kcal
                            </div>

                            <div>
                                💪 {nutritionData.protein}g
                            </div>

                            <div>
                                🍚 {nutritionData.carbs}g
                            </div>

                            <div>
                                🥑 {nutritionData.fats}g
                            </div>

                        </div>

                    </div>


                    <div className="nutrition-grid">

                        <div className="nutrition-card">
                            <h2>🔥</h2>
                            <h1>{nutritionData.calories}</h1>
                            <p>Calories</p>
                        </div>

                        <div className="nutrition-card">
                            <h2>💪</h2>
                            <h1>{nutritionData.protein}g</h1>
                            <p>Protein</p>
                        </div>

                        <div className="nutrition-card">
                            <h2>🍚</h2>
                            <h1>{nutritionData.carbs}g</h1>
                            <p>Carbs</p>
                        </div>

                        <div className="nutrition-card">
                            <h2>🥑</h2>
                            <h1>{nutritionData.fats}g</h1>
                            <p>Fats</p>
                        </div>

                    </div>

                </>
            )}


            <div className="food-layout">

                <div className="food-search">

                    <h2>
                        🔍 SEARCH FOOD
                    </h2>

                    <input
                        type="text"
                        placeholder="Search for a food..."
                        value={foodSearch}
                        onChange={(event) =>
                            setFoodSearch(
                                event.target.value
                            )
                        }
                    />

                    <button
                        onClick={handleSearch}
                    >
                        Search
                    </button>

                </div>


                <div className="food-log">

                    <h2>
                        📋 TODAY'S FOOD LOG
                    </h2>

                    {
                        foodResults.map(
                            (
                                food,
                                index
                            ) => (

                                <div
                                    className="food-item"
                                    key={index}
                                >

                                    <div>

                                        <strong>
                                            {food.name}
                                        </strong>

                                        <p>
                                            💪 {food.protein}g
                                            🍚 {food.carbs}g
                                            🥑 {food.fats}g
                                        </p>

                                    </div>

                                    <span>
                                        {food.calories} kcal
                                    </span>

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
                            💪 {totalProtein}g protein
                        </p>

                        <p>
                            🍚 {totalCarbs}g carbs
                        </p>

                        <p>
                            🥑 {totalFats}g fats
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};