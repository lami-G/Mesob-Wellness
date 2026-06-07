import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AnimatedWaveBackground from "../../components/AnimatedWaveBackground";
import Card from "../../components/shared/Card";
import styles from "./Login.module.css";

const CACHED_CREDENTIALS_KEY = "mesob_cached_credentials";

const DEFAULT_CREDENTIALS = {
  "staff@mesob.et": "Staff123!",
  "nurse@mesob.et": "Nurse123!",
  "manager@mesob.et": "Manager123!",
  "regional@mesob.et": "Regional123!",
  "federal@mesob.et": "Federal123!",
  "admin@mesob.et": "Admin123!",
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cachedCredentials, setCachedCredentials] = useState({});

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHED_CREDENTIALS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCachedCredentials({ ...DEFAULT_CREDENTIALS, ...parsed });
      } else {
        setCachedCredentials(DEFAULT_CREDENTIALS);
      }
    } catch (error) {
      console.error("Error loading cached credentials:", error);
      setCachedCredentials(DEFAULT_CREDENTIALS);
    }
  }, []);

  const cacheCredentials = (email, password) => {
    try {
      const cached = localStorage.getItem(CACHED_CREDENTIALS_KEY);
      const existing = cached ? JSON.parse(cached) : {};
      const updated = { ...existing, [email]: password };
      localStorage.setItem(CACHED_CREDENTIALS_KEY, JSON.stringify(updated));
      setCachedCredentials({ ...DEFAULT_CREDENTIALS, ...updated });
    } catch (error) {
      console.error("Error caching credentials:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = { ...formData, [name]: value };
    if (name === "email") {
      const emailLower = value.trim().toLowerCase();
      const cachedPassword = cachedCredentials[emailLower];
      if (cachedPassword) nextFormData.password = cachedPassword;
    }
    setFormData(nextFormData);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setServerError("");
    const result = await login(formData.email, formData.password);
    if (result.success) {
      cacheCredentials(formData.email.toLowerCase(), formData.password);
      const roleRoutes = {
        EXTERNAL_PATIENT: "/dashboard",
        STAFF: "/dashboard",
        NURSE_OFFICER: "/nurse",
        MANAGER: "/manager",
        REGIONAL_OFFICE: "/regional",
        FEDERAL_OFFICE: "/federal",
        SYSTEM_ADMIN: "/admin",
      };
      const route = roleRoutes[result?.user?.role] || "/dashboard";
      navigate(route, { replace: true });
      setLoading(false);
    } else {
      setServerError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <AnimatedWaveBackground />

      <div className={styles.container}>
        <Card variant="elevated" padding="lg" className={styles.card}>

          {/* ── Logo (image already contains emblem + all Amharic/English text) ── */}
          <div className={styles.headerImage}>
            <img src="/image.png" alt="MESOB Service Logo" />
          </div>

          {/* ── Welcome ── */}
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcome}>Welcome</h1>
            <p className={styles.subtitle}>Access the Mesob wellness Center System</p>
          </div>

          {/* ── Server error ── */}
          {serverError && (
            <div className={styles.alertError} role="alert">
              {serverError}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Email */}
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Username"
                  disabled={loading}
                  autoComplete="username email"
                  list="mesob-email-suggestions"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""} ${loading ? styles.inputDisabled : ""}`}
                />
              </div>
              <datalist id="mesob-email-suggestions">
                {Object.keys(cachedCredentials).map((email) => (
                  <option key={email} value={email} />
                ))}
              </datalist>
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  disabled={loading}
                  autoComplete="current-password"
                  className={`${styles.input} ${styles.inputPassword} ${errors.password ? styles.inputError : ""} ${loading ? styles.inputDisabled : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* ── Footer — Wellness style (from image 3) ── */}
          <hr className={styles.divider} />
          <div className={styles.footer}>
            <div className={styles.footerBrand}>Wellness</div>
            <p className={styles.footerLink}>
              Don't have an account?{" "}
              <Link to="/register">Create one here</Link>
            </p>
          </div>

        </Card>
      </div>
    </div>
  );
}

export default Login;