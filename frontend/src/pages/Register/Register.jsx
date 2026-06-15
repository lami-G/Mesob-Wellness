import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AnimatedWaveBackground from "../../components/AnimatedWaveBackground";
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
      setFormData(prev => ({ ...prev, centerId: "" }));
    }
  }, [formData.region]);

  const fetchRegions = async () => {
    setRegionsLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/v1/regions`;
      console.log('Fetching regions from:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('Regions response:', data);
      if (data.status === "success" && Array.isArray(data.data)) {
        setRegions(data.data);
        console.log('Regions loaded:', data.data);
      } else {
        console.error('Invalid regions response format:', data);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setRegionsLoading(false);
    }
  };

  const fetchCenters = async (region) => {
    setCentersLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/v1/centers?region=${encodeURIComponent(region)}`;
      console.log('Fetching centers from:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('Centers response:', data);
      if (data.status === "success" && Array.isArray(data.data)) {
        setCenters(data.data);
        console.log('Centers loaded:', data.data);
      } else {
        console.error('Invalid centers response format:', data);
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
        `${import.meta.env.VITE_API_URL}/api/v1/hr/employee/${formData.employeeId}`,
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Employee not found in HR system");
      }

      // Auto-fill form with HR data
      const employee = data.data;
      setFormData(prev => ({
        ...prev,
        fullName: employee.fullName || prev.fullName,
        email: employee.email || prev.email,
        phone: employee.phone || prev.phone,
        dateOfBirth: employee.dateOfBirth || prev.dateOfBirth,
        gender: employee.gender || prev.gender,
        region: employee.region || prev.region,
        centerId: employee.centerId || prev.centerId,
      }));

      setHrSuccess("Employee data loaded successfully! Please review and complete the form.");
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
      "email",
      "password",
      "confirmPassword",
      "phone",
      "dateOfBirth",
      "gender",
      "region",
      "centerId",
      "emergencyContactName",
      "emergencyContactPhone",
    ];

    const firstErrorField = fieldOrder.find((field) => errorFields[field]);
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        const scrollContainer = document.querySelector(`.${styles.formScroll}`);
        if (scrollContainer) {
          const elementRect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const scrollTop = scrollContainer.scrollTop;
          const elementTop = elementRect.top - containerRect.top + scrollTop;
          scrollContainer.scrollTo({
            top: elementTop - 50,
            behavior: "smooth",
          });
        }
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
        {
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
        },
      );

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
          {/* Logo and Header Section */}
          <div className={styles.logoSection}>
            <div className={styles.logoCircle}>
              <img
                src="/Mesob-short-png.png"
                alt="MESOB Logo"
              />
            </div>
            <div className={styles.titleAmharic}>
              በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ
            </div>
            <div className={styles.titleAmharic}>
              የመሶብ አገልግሎት
            </div>
            <div className={styles.titleEnglish}>
              Federal Democratic Republic of Ethiopia
            </div>
            <div className={styles.serviceTitle}>
              MESOB Service
            </div>
            <div className={styles.welcome}>
              Create Account
            </div>
            <div className={styles.subtitle}>
              Join the MESOB Wellness Center System
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {serverError && (
              <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                {serverError}
              </div>
            )}

            {successMessage && (
              <div className={`${styles.alert} ${styles.alertSuccess}`} role="alert">
                {successMessage}
              </div>
            )}

            {/* Scrollable Form Content */}
            <div className={styles.formScroll}>
              {/* Employee ID Lookup Section */}
              <div className={styles.hrSection}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Employee ID (Optional)
                    <span className={styles.formHint}> - Auto-fill from HR system</span>
                  </label>
                  <div className={styles.inputWithButton}>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="e.g., EMP001"
                      disabled={loading || hrLoading}
                      className={styles.formInput}
                    />
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={handleFetchFromHR}
                      disabled={loading || hrLoading || !formData.employeeId.trim()}
                    >
                      {hrLoading ? "Loading..." : "Search"}
                    </button>
                  </div>
                  {hrError && (
                    <span className={styles.formError}>{hrError}</span>
                  )}
                  {hrSuccess && (
                    <span className={styles.formSuccess}>{hrSuccess}</span>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Full Name<span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.fullName ? styles.error : ""}`}
                />
                {errors.fullName && (
                  <span className={styles.formError}>{errors.fullName}</span>
                )}
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Email<span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="mail@example.com"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.email ? styles.error : ""}`}
                />
                {errors.email && (
                  <span className={styles.formError}>{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Password<span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars with uppercase, lowercase, numbers, special chars"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.password ? styles.error : ""}`}
                />
                {errors.password && (
                  <span className={styles.formError}>{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Confirm Password<span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ""}`}
                />
                {errors.confirmPassword && (
                  <span className={styles.formError}>{errors.confirmPassword}</span>
                )}
              </div>

              {/* Phone */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone Number<span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+251 9XX XXX XXXX"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.phone ? styles.error : ""}`}
                />
                {errors.phone && (
                  <span className={styles.formError}>{errors.phone}</span>
                )}
              </div>

              {/* Date of Birth */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Date of Birth<span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${styles.formInput} ${errors.dateOfBirth ? styles.error : ""}`}
                />
                {errors.dateOfBirth && (
                  <span className={styles.formError}>{errors.dateOfBirth}</span>
                )}
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Gender<span className={styles.required}>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${styles.formSelect} ${errors.gender ? styles.error : ""}`}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.gender && (
                  <span className={styles.formError}>{errors.gender}</span>
                )}
              </div>

              {/* Region */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Region<span className={styles.required}>*</span>
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  disabled={loading || regionsLoading}
                  className={`${styles.formSelect} ${errors.region ? styles.error : ""}`}
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
                  <span className={styles.formError}>{errors.region}</span>
                )}
              </div>

              {/* Health Center */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                   Center <span className={styles.required}>*</span>
                </label>
                <select
                  name="centerId"
                  value={formData.centerId}
                  onChange={handleChange}
                  disabled={loading || centersLoading || !formData.region}
                  className={`${styles.formSelect} ${errors.centerId ? styles.error : ""}`}
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
                  <span className={styles.formError}>{errors.centerId}</span>
                )}
              </div>

              {/* Emergency Contact Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Emergency Contact Name<span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Contact person name"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.emergencyContactName ? styles.error : ""}`}
                />
                {errors.emergencyContactName && (
                  <span className={styles.formError}>{errors.emergencyContactName}</span>
                )}
              </div>

              {/* Emergency Contact Phone */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Emergency Contact Phone<span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+251 9XX XXX XXXX"
                  disabled={loading}
                  className={`${styles.formInput} ${errors.emergencyContactPhone ? styles.error : ""}`}
                />
                {errors.emergencyContactPhone && (
                  <span className={styles.formError}>{errors.emergencyContactPhone}</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{" "}
              <Link to="/login" className={styles.link}>
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
