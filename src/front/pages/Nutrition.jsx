import React, { useEffect, useState } from "react";

export const Nutrition = () => {
    const [nutritionData, setNutritionData] = useState(null);
    const [goal, setGoal] = useState("muscle_gain");

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
                    body: JSON.stringify({
                        goal: goal
                    })
                }
            );

            const data = await response.json();
            setNutritionData(data);

        } catch (error) {
            console.error("Error fetching nutrition data:", error);
        }
    };

    return (
        <div>
            <h1>Nutrition</h1>

            <select
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
            >
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="recomposition">Body Recomposition</option>
            </select>

            {nutritionData && (
                <>
                    <div className="nutrition-summary">
                        <h3>🤖 AI COACH — NUTRITION RECOMMENDATION</h3>

                        <p>{nutritionData.message}</p>

                        <div className="macro-tags">
                            <div>🔥 {nutritionData.calories} kcal</div>
                            <div>💪 {nutritionData.protein}g</div>
                            <div>🍚 {nutritionData.carbs}g</div>
                            <div>🥑 {nutritionData.fats}g</div>
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
        </div>
    );
};