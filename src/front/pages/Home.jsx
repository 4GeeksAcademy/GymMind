import React from "react";
import { Link } from "react-router-dom";

export const Home = () => {

	return (

		<div className="container text-center mt-5">

			<h1 className="display-1 fw-bold">
				GYMMIND AI
			</h1>

			<p className="lead mt-4">
				AI Powered Fitness Platform
			</p>

			<div className="mt-5">

				<Link to="/signup">

					<button className="btn btn-primary btn-lg me-3">
						Signup
					</button>

				</Link>

				<Link to="/login">

					<button className="btn btn-dark btn-lg">
						Login
					</button>

				</Link>

			</div>

		</div>
	);
};