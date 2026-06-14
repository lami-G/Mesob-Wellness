import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import FeedbackModal from "./FeedbackModal";
import clsx from "clsx";
import styles from "./FeedbackList.module.css";

function FeedbackList({ baseFilters = {} }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [filters, setFilters] = useState({
    timePeriod: "daily",
    region: "",
    center: "",
    npsScore: "",
    feedbackType: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    ...baseFilters,
  });

  useEffect(() => {
    fetchFeedback();
  }, [page, filters]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...baseFilters }));
  }, [baseFilters]);

  useEffect(() => {
    // Fetch regions on mount
    fetchRegions();
  }, []);

  useEffect(() => {
    // Fetch centers when region changes
    if (filters.region) {
      fetchCenters(filters.region);
    } else {
      setCenters([]);
    }
  }, [filters.region]);

  // Calculate date range based on time period
  useEffect(() => {
    if (filters.timePeriod === "all") {
      setFilters(prev => ({ ...prev, dateFrom: "", dateTo: "" }));
      return;
    }

    const today = new Date();
    let startDate = null;
    let endDate = null;

    if (filters.timePeriod === "daily") {
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const date = today.getUTCDate();
      startDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
    } else if (filters.timePeriod === "weekly") {
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const date = today.getUTCDate();
      startDate = new Date(Date.UTC(year, month, date - 6, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
    } else if (filters.timePeriod === "monthly") {
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const date = today.getUTCDate();
      startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
    }

    if (startDate && endDate) {
      setFilters(prev => ({
        ...prev,
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0]
      }));
    }
  }, [filters.timePeriod]);

  const fetchRegions = async () => {
    try {
      const data = await adminService.getRegions();
      setRegions(data);
    } catch (err) {
      console.error("Error fetching regions:", err);
    }
  };

  const fetchCenters = async (region) => {
    try {
      const data = await adminService.getCentersByRegion(region);
      setCenters(data);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setCenters([]);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFeedback({
        ...filters,
        page,
        limit: 20,
      });
      setFeedback(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load feedback");
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      // Clear center filter when region changes
      if (name === 'region') {
        newFilters.center = '';
      }
      return newFilters;
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      timePeriod: "daily",
      region: "",
      center: "",
      npsScore: "",
      feedbackType: "",
      dateFrom: "",
      dateTo: "",
      search: "",
      ...baseFilters,
    });
    setPage(1);
  };

  const getNPSColor = (score) => {
    if (score >= 9) return "promoter";
    if (score >= 7) return "passive";
    return "detractor";
  };

  if (loading) return <div className={styles.loading}>Loading feedback...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.feedbackList}>
      <FeedbackModal
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />

      <div className={styles.listHeader}>
        <h2>Customer Feedback</h2>
      </div>

      <div className={styles.filters}>
        <select
          name="timePeriod"
          value={filters.timePeriod}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="all">All Time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          name="region"
          value={filters.region}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select
          name="center"
          value={filters.center}
          onChange={handleFilterChange}
          className={styles.filterSelect}
          disabled={!filters.region}
        >
          <option value="">All Centers</option>
          {centers.map((center) => (
            <option key={center.id} value={center.name}>
              {center.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="dateFrom"
          placeholder="Date From"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <input
          type="date"
          name="dateTo"
          placeholder="Date To"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <select
          name="npsScore"
          value={filters.npsScore}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All NPS Scores</option>
          <option value="9">Promoter (9-10)</option>
          <option value="7">Passive (7-8)</option>
          <option value="0">Detractor (0-6)</option>
        </select>
        <select
          name="feedbackType"
          value={filters.feedbackType}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="SERVICE">Service</option>
          <option value="FACILITY">Facility</option>
          <option value="STAFF">Staff</option>
        </select>
        <input
          type="text"
          name="search"
          placeholder="Search..."
          value={filters.search}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <button onClick={handleResetFilters} className={styles.btnReset}>
          Reset
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>NPS Score</th>
            <th>Service Quality</th>
            <th>Staff Behavior</th>
            <th>Cleanliness</th>
            <th>Wait Time</th>
            <th>Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {feedback.map((item) => (
            <tr key={item.id}>
              <td>{item.user?.fullName || "N/A"}</td>
              <td>
                <span
                  className={clsx(styles.badge, styles.badgeNps, styles[`badge${getNPSColor(item.npsScore).charAt(0).toUpperCase() + getNPSColor(item.npsScore).slice(1)}`])}
                >
                  {item.npsScore || "-"}/10
                </span>
              </td>
              <td>
                <span className={styles.rating}>{item.serviceQuality || "-"}/5</span>
              </td>
              <td>
                <span className={styles.rating}>{item.staffBehavior || "-"}/5</span>
              </td>
              <td>
                <span className={styles.rating}>{item.cleanliness || "-"}/5</span>
              </td>
              <td>
                <span className={styles.rating}>{item.waitTime || "-"}/5</span>
              </td>
              <td>{item.feedbackType || "-"}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className={styles.btnView}
                  onClick={() => setSelectedFeedback(item)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {feedback.length === 0 && (
        <div className={styles.emptyState}>No feedback found</div>
      )}

      <div className={styles.pagination}>
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className={styles.btnPrev}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={feedback.length < 20}
          className={styles.btnNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default FeedbackList;
