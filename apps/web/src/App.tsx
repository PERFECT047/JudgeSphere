import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./page/LoginPage";
import ProblemsPage from "./page/ProblemsPage";
import ProblemSolvePage from "./page/ProblemSolvePage";
import AppLayout from "./layout/AppLayout";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/problems"
            element={token ? <ProblemsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/problems/:slug"
            element={token ? <ProblemSolvePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={token ? "/problems" : "/login"} />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;