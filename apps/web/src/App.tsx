import LoginPage from "./page/LoginPage";
import Dashboard from "./page/Dashboard";
import AppLayout from "./layout/AppLayout";

function App() {
  const token = localStorage.getItem("token");

  let currentPage = <LoginPage />;

  if (token && window.location.pathname === "/dashboard") {
    currentPage = <Dashboard />;
  }

  return (
    <AppLayout>
      {currentPage}
    </AppLayout>
  );
}

export default App;