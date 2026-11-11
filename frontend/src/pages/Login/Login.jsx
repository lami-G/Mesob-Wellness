import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogIn,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";

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
      {/* Top Left Branding Header */}
      <header className={styles.topHeader}>
        <div className={styles.brandHeader}>
          <img
            src="/Mesob-short-png.png"
            alt="MESOB Emblem"
            className={styles.brandEmblem}
          />
          <div className={styles.brandDivider} aria-hidden="true"></div>
          <div className={styles.brandTitles}>
            <span className={styles.brandName}>MESOB</span>
            <span className={styles.brandTagline}>Wellness Portal</span>
          </div>
        </div>
      </header>

      {/* Main 2-Column Showcase */}
      <main className={styles.mainContainer}>
        {/* Left Hero Column */}
        <div className={styles.heroColumn}>
          <h1 className={styles.heroTitle}>
            Welcome to <br />
            <span className={styles.heroHighlight}>MESOB</span> Wellness Center
          </h1>
          <div className={styles.heroAccentBar}></div>
          <p className={styles.heroSubtitle}>
            Your comprehensive healthcare and wellness portal. Access health assessments, medical checkups, and personalized wellness plans with ease and security.
          </p>
        </div>

        {/* Right Glassmorphic Card Column */}
        <div className={styles.cardColumn}>
          <div className={styles.card}>
            {/* Top Accent Strip */}
            <div className={styles.cardTopAccent}></div>

            {/* Emblem & Original Header Texts */}
            <div className={styles.cardHeader}>
              <img
                src="/Mesob-short-png.png"
                alt="MESOB Emblem"
                className={styles.cardEmblem}
              />
              <div className={styles.amharicHeader}>
                <p className={styles.amharicLine1}>በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ</p>
                <p className={styles.amharicLine2}>የመሶብ አገልግሎት</p>
              </div>
              <div className={styles.mesobBrandText}>MESOB</div>
              <div className={styles.countryDivider}>
                <span className={styles.countryLine}></span>
                <span className={styles.countryText}>Federal Democratic Republic of Ethiopia</span>
                <span className={styles.countryLine}></span>
              </div>
            </div>

            {/* Welcome Back Title */}
            <div className={styles.welcomeSection}>
              <h2 className={styles.welcomeTitle}>
                Welcome <span className={styles.welcomeHighlight}>Back!</span>
              </h2>
              <p className={styles.welcomeSubtitle}>
                Sign in to your wellness account
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className={styles.alertError} role="alert">
                <AlertCircle size={15} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* Email */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={17} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
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
                  <Lock className={styles.inputIcon} size={17} />
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
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={styles.loginButton}
              >
                <LogIn size={18} />
                <span>{loading ? "Signing in..." : "Login"}</span>
              </button>
            </form>

            {/* OR Divider */}
            <div className={styles.orDivider}>
              <span className={styles.orLine}></span>
              <span className={styles.orText}>OR</span>
              <span className={styles.orLine}></span>
            </div>

            {/* Register Link */}
            <p className={styles.signupPrompt}>
              Don't have an account?{" "}
              <Link to="/register" className={styles.signupLink}>
                Create one here
              </Link>
            </p>

            {/* Trust & Security Badge */}
            <div className={styles.trustBadge}>
              <ShieldCheck size={13} />
              <span>Secure & Trusted</span>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Layered Bottom Wave — Left & Right Organic Swooshes Frame Center Carpet */}
      <div className={styles.bottomWaveContainer} aria-hidden="true">
        <svg
          className={styles.bottomWaveSvg}
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Left Wave Cluster: Royal Blue Layer (#073D91) */}
          <path
            d="M -10,45 C 120,12 250,26 380,55 C 460,72 510,84 560,90 L -10,90 Z"
            fill="#073D91"
          />
          {/* Left Wave Cluster: Deep Navy Base (#061D50) */}
          <path
            d="M -10,54 C 120,20 250,34 380,62 C 460,78 510,87 560,90 L -10,90 Z"
            fill="#061D50"
          />
          {/* Left Wave Cluster: Thick Gold Diagonal Ribbon (#FFB511, 10px stroke) */}
          <path
            d="M -10,45 C 120,12 250,26 380,55 C 460,72 510,84 560,90"
            stroke="#FFB511"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Wave Cluster: Royal Blue Layer (#073D91) */}
          <path
            d="M 1000,90 C 1120,80 1220,60 1315,40 C 1375,26 1415,18 1450,11 L 1450,90 L 1000,90 Z"
            fill="#073D91"
          />
          {/* Right Wave Cluster: Deep Navy Base (#061D50) */}
          <path
            d="M 1010,90 C 1125,84 1225,66 1315,47 C 1375,33 1415,25 1450,18 L 1450,90 L 1010,90 Z"
            fill="#061D50"
          />
          {/* Right Wave Cluster: Flowing Gold Diagonal Ribbon (#FFB511, 10px stroke) */}
          <path
            d="M 1000,90 C 1120,80 1220,60 1315,40 C 1375,26 1415,18 1450,11"
            stroke="#FFB511"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

export default Login;
