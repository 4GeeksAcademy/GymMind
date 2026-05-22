import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Private } from "./pages/Private";
import { Dashboard } from "./pages/Dashboard";
import { Nutrition } from "./pages/Nutrition";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import { Progress } from "./pages/Progress";
import { MoodCheckPage } from "./pages/MoodCheckPage";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/private" element={<Private />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/nutrition" element={<Nutrition />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/moodcheck" element={<MoodCheckPage />} />
    </Route>
  )
);