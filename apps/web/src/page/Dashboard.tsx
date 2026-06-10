import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../feature/auth/authSlice";
import { logoutAPI } from "../feature/auth/authAPI";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      dispatch(logout());
      window.location.href = "/";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Welcome back, {user?.name || "User"}!
        </p>
      </div>

      {/* Welcome Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 mb-8 shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Getting Started
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Your dashboard is currently being set up. More features coming soon!
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold">User Email:</span> {user?.email}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex gap-4">
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold rounded-lg transition-all duration-150 shadow-md hover:shadow-red-500/20"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
