import React from "react";
import { useAppDispatch } from "../app/hooks";
import { logout } from "../feature/auth/authSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">(Blank for now)</p>
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
