import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AnimatedWaveBackground from "../../components/AnimatedWaveBackground";
import Card from "../../components/shared/Card";
import styles from "./Login.module.css";

// Credentials management removed for production security

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    setFormData({ ...formData, [name]: value });
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
            <p className={styles.subtitle}> Mesob wellness Center</p>
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
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email"
                  disabled={loading}
                  autoComplete="username email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""} ${loading ? styles.inputDisabled : ""}`}
                />
              </div>
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