import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./page/LoginPage";
import DashboardPage from "./page/DashboardPage";
import ProblemsPage from "./page/ProblemsPage";
import ProblemSolvePage from "./page/ProblemSolvePage";
import SnippetManagerPage from "./page/SnippetManagerPage";
import SettingsPage from "./page/SettingsPage";
import AppLayout from "./layout/AppLayout";
import { useAppSelector } from "./app/hooks";

function App() {
  const token = useAppSelector((state) => state.auth.token);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={token ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/problems"
            element={token ? <ProblemsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/problems/:slug"
            element={token ? <ProblemSolvePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/snippets"
            element={token ? <SnippetManagerPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={token ? <SettingsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
