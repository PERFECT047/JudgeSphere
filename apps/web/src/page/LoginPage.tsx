import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loginUser, signupUser } from "../feature/auth/authThunk";
import { CreateUserDtoSchema, LoginDtoSchema } from "@repo/dto";
import { z } from "zod";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error: apiError, token } = useAppSelector((state) => state.auth);

  const [isSignup, setIsSignup] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // If user is already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[e.target.name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      if (isSignup) {
        const parsedData = CreateUserDtoSchema.parse(formData);
        const resultAction = await dispatch(signupUser(parsedData));
        if (signupUser.fulfilled.match(resultAction)) {
          navigate("/dashboard");
        }
      } else {
        const parsedData = LoginDtoSchema.parse({
          email: formData.email,
          password: formData.password,
        });
        const resultAction = await dispatch(loginUser(parsedData));
        if (loginUser.fulfilled.match(resultAction)) {
          navigate("/dashboard");
        }
      }
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        
        zodError.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        
        setFieldErrors(errors);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-transparent">
      <div className="w-full p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl shadow-xl transition-colors duration-300">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Judge Sphere
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            AI-Native Online Judge Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {isSignup ? "Create an account" : "Sign In"}
          </div>

          {/* Name Field */}
          {isSignup && (
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-slate-900 dark:text-white outline-none focus:ring-2 transition-all ${
                  fieldErrors.name 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-slate-200 dark:border-slate-700 focus:ring-cyan-500"
                }`}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.name}</p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-slate-900 dark:text-white outline-none focus:ring-2 transition-all ${
                fieldErrors.email 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-slate-200 dark:border-slate-700 focus:ring-cyan-500"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-slate-900 dark:text-white outline-none focus:ring-2 transition-all ${
                fieldErrors.password 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-slate-200 dark:border-slate-700 focus:ring-cyan-500"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remote API Server Error */}
          {apiError && (
            <div className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-[0.99] transition-all duration-150 text-white font-semibold shadow-md hover:shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <span>{isSignup ? "Creating account..." : "Signing in..."}</span>
            ) : (
              <span>{isSignup ? "Sign Up" : "Login"}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setFieldErrors({});
            }}
            className="text-cyan-600 dark:text-cyan-400 font-semibold cursor-pointer hover:underline ml-1"
          >
            {isSignup ? "Log in" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}