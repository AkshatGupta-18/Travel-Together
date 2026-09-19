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
import CreateTrip from "../pages/CreateTrip";
import MyTrips from "../pages/Mytrips";
import FindBuddies from "../pages/Home/FindBuddies";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
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
      <Route
        path="/match"
        element={
          <ProtectedRoute>
            <FindBuddies/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/:userId"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <MyTrips />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}