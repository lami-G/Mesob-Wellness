import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import AnimatedWaveBackground from "../../components/AnimatedWaveBackground";
import { getApiUrl } from "../../services/apiBase";
import styles from "./Register.module.css";

export const AMHARIC_HEADER_LINES = [
  "በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ",
  "የመጠለያ አገልግሎት",
];

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    region: "",
    centerId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // HR lookup state
  const [hrLoading, setHrLoading] = useState(false);
  const [hrError, setHrError] = useState("");
  const [hrSuccess, setHrSuccess] = useState("");

  // Regions and centers state
  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [centersLoading, setCentersLoading] = useState(false);

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  // Fetch centers when region changes
  useEffect(() => {
    if (formData.region) {
      fetchCenters(formData.region);
    } else {
      setCenters([]);
      setFormData((prev) => ({ ...prev, centerId: "" }));
    }
  }, [formData.region]);

  const fetchRegions = async () => {
    setRegionsLoading(true);
    try {
      const url = getApiUrl("/api/v1/regions");
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setRegions(data.data);
      } else {
        setRegions([]);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      setRegions([]);
    } finally {
      setRegionsLoading(false);
    }
  };

  const fetchCenters = async (region) => {
    setCentersLoading(true);
    try {
      const url = getApiUrl(`/api/v1/centers?region=${encodeURIComponent(region)}`);
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setCenters(data.data);
      } else {
        setCenters([]);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      setCenters([]);
    } finally {
      setCentersLoading(false);
    }
  };

  const handleFetchFromHR = async () => {
    if (!formData.employeeId.trim()) {
      setHrError("Please enter an employee ID");
      return;
    }

    setHrLoading(true);
    setHrError("");
    setHrSuccess("");

    try {
      const response = await fetch(
        getApiUrl(`/api/v1/hr/employee/${encodeURIComponent(formData.employeeId)}`),
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Employee not found in HR system");
      }

      const employee = data.data;
      setFormData((prev) => ({
        ...prev,
        fullName: employee.fullName || prev.fullName,
        email: employee.email || prev.email,
        phone: employee.phone || prev.phone,
        dateOfBirth: employee.dateOfBirth || prev.dateOfBirth,
        gender: employee.gender || prev.gender,
        region: employee.region || prev.region,
        centerId: employee.centerId || prev.centerId,
      }));

      setHrSuccess("Employee data loaded successfully!");
    } catch (error) {
      setHrError(error.message || "Failed to fetch employee data");
    } finally {
      setHrLoading(false);
    }
  };

  const scrollToFirstError = (errorFields) => {
    const fieldOrder = [
      "employeeId",
      "fullName",
      "phone",
      "email",
      "dateOfBirth",
      "gender",
      "region",
      "centerId",
      "password",
      "confirmPassword",
      "emergencyContactName",
      "emergencyContactPhone",
    ];

    const firstErrorField = fieldOrder.find((field) => errorFields[field]);
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus({ preventScroll: true });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(
        formData.password,
      )
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, numbers, and special characters (!@#$%^&*...)";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const age =
        new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.region) {
      newErrors.region = "Region is required";
    }

    if (!formData.centerId) {
      newErrors.centerId = "Health center is required";
    }

    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
    }

    if (!formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = "Emergency contact phone is required";
    } else if (
      !/^\d{10,}$/.test(formData.emergencyContactPhone.replace(/\D/g, ""))
    ) {
      newErrors.emergencyContactPhone = "Please enter a valid phone number";
    }

    setErrors(newErrors);

    // Auto-scroll to first error field
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => scrollToFirstError(newErrors), 0);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setServerError("");
    setHrError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const response = await fetch(getApiUrl("/api/v1/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          centerId: formData.centerId,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again.",
        );
      }

      setSuccessMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <AnimatedWaveBackground />

      <div className={styles.container}>
        <div className={styles.card}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <img
              src="/image.png"
              alt="MESOB One-Stop Service Center"
              className={styles.brandLogo}
            />
            <h1 className={styles.welcomeTitle}>Create Account</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {serverError && (
              <div className={`${styles.alertBox} ${styles.alertError}`} role="alert">
                <AlertCircle size={15} />
                <span>{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div className={`${styles.alertBox} ${styles.alertSuccess}`} role="alert">
                <CheckCircle2 size={15} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Employee ID Lookup Banner */}
            <div className={styles.hrBanner}>
              <div className={styles.hrInputRow}>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Employee ID (Auto-fill from HR)"
                  disabled={loading || hrLoading}
                  className={styles.hrInput}
                />
                <button
                  type="button"
                  className={styles.hrButton}
                  onClick={handleFetchFromHR}
                  disabled={loading || hrLoading || !formData.employeeId.trim()}
                >
                  <UserCheck size={13} />
                  {hrLoading ? "..." : "Auto-fill"}
                </button>
              </div>
              {hrError && (
                <span className={styles.fieldError} style={{ marginTop: "0.25rem", display: "block" }}>
                  {hrError}
                </span>
              )}
              {hrSuccess && (
                <span style={{ color: "#86efac", fontSize: "0.72rem", marginTop: "0.25rem", display: "block" }}>
                  {hrSuccess}
                </span>
              )}
            </div>

            {/* Inputs 2-Column Grid */}
            <div className={styles.gridTwoCol}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="fullName">
                  <span>Full Name<span className={styles.required}>*</span></span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.fullName ? styles.inputError : ""}`}
                />
                {errors.fullName && (
                  <span className={styles.fieldError}>{errors.fullName}</span>
                )}
              </div>

              {/* Phone */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="phone">
                  <span>Phone Number<span className={styles.required}>*</span></span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+251 9XX XXX XXXX"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.phone ? styles.inputError : ""}`}
                />
                {errors.phone && (
                  <span className={styles.fieldError}>{errors.phone}</span>
                )}
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="email">
                  <span>Email<span className={styles.required}>*</span></span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="mail@example.com"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.email ? styles.inputError : ""}`}
                />
                {errors.email && (
                  <span className={styles.fieldError}>{errors.email}</span>
                )}
              </div>

              {/* Date of Birth */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="dateOfBirth">
                  <span>Date of Birth<span className={styles.required}>*</span></span>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${styles.formInput} ${errors.dateOfBirth ? styles.inputError : ""}`}
                />
                {errors.dateOfBirth && (
                  <span className={styles.fieldError}>{errors.dateOfBirth}</span>
                )}
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="gender">
                  <span>Gender<span className={styles.required}>*</span></span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${styles.formSelect} ${errors.gender ? styles.inputError : ""}`}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.gender && (
                  <span className={styles.fieldError}>{errors.gender}</span>
                )}
              </div>

              {/* Region */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="region">
                  <span>Region<span className={styles.required}>*</span></span>
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  disabled={loading || regionsLoading}
                  className={`${styles.formSelect} ${errors.region ? styles.inputError : ""}`}
                >
                  <option value="">
                    {regionsLoading ? "Loading regions..." : "Select Region"}
                  </option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <span className={styles.fieldError}>{errors.region}</span>
                )}
              </div>

              {/* Center */}
              <div className={`${styles.formGroup} ${styles.colSpanFull}`}>
                <label className={styles.formLabel} htmlFor="centerId">
                  <span>Center<span className={styles.required}>*</span></span>
                </label>
                <select
                  id="centerId"
                  name="centerId"
                  value={formData.centerId}
                  onChange={handleChange}
                  disabled={loading || centersLoading || !formData.region}
                  className={`${styles.formSelect} ${errors.centerId ? styles.inputError : ""}`}
                >
                  <option value="">
                    {!formData.region
                      ? "Select region first"
                      : centersLoading
                      ? "Loading centers..."
                      : centers.length === 0
                      ? "No centers available"
                      : "Select Center"}
                  </option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.city}
                    </option>
                  ))}
                </select>
                {errors.centerId && (
                  <span className={styles.fieldError}>{errors.centerId}</span>
                )}
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="password">
                  <span>Password<span className={styles.required}>*</span></span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars, mixed"
                    disabled={loading}
                    className={`${styles.formInput} ${errors.password ? styles.inputError : ""}`}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.fieldError}>{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="confirmPassword">
                  <span>Confirm Password<span className={styles.required}>*</span></span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    disabled={loading}
                    className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ""}`}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className={styles.fieldError}>{errors.confirmPassword}</span>
                )}
              </div>

              {/* Emergency Contact Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="emergencyContactName">
                  <span>Emergency Contact Name<span className={styles.required}>*</span></span>
                </label>
                <input
                  id="emergencyContactName"
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Contact person name"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.emergencyContactName ? styles.inputError : ""}`}
                />
                {errors.emergencyContactName && (
                  <span className={styles.fieldError}>{errors.emergencyContactName}</span>
                )}
              </div>

              {/* Emergency Contact Phone */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="emergencyContactPhone">
                  <span>Emergency Phone<span className={styles.required}>*</span></span>
                </label>
                <input
                  id="emergencyContactPhone"
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+251 9XX XXX XXXX"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.emergencyContactPhone ? styles.inputError : ""}`}
                />
                {errors.emergencyContactPhone && (
                  <span className={styles.fieldError}>{errors.emergencyContactPhone}</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?
              <Link to="/login" className={styles.signinLink}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
