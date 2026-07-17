import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import EditProfilePage from "../pages/Home/Editprofilepage";
import Landing from "../pages/landing/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Homepage from "../pages/Home/Homepage";
import CreatePost from "../pages/Home/createPost";
import ProfilePage from "../pages/profile/ProfilePage";
import UserProfilePage from "../pages/profile/UserProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route
        path="/homepage"
        element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/user/:userId" element={<UserProfilePage />} />


    </Routes>
  );
}