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
  const [filters, setFilters] = useState({
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
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
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
        <button className={styles.btnExport}>Export</button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          name="search"
          placeholder="Search by patient..."
          value={filters.search}
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
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
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
