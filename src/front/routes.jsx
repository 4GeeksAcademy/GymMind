import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import { Progress } from "./pages/Progress";
import { MoodCheckPage } from "./pages/MoodCheckPage";
import { Nutrition } from "./pages/Nutrition";
import { MyWorkout } from "./pages/MyWorkout";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/moodcheck" element={<MoodCheckPage />} />
      <Route path="/nutrition" element={<Nutrition />} />
      <Route path="/workout" element={<MyWorkout />} /> 
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
    </Route>
  )
);
