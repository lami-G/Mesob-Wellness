import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import clsx from "clsx";
import styles from "./FeedbackAnalytics.module.css";

function FeedbackAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region: "",
    center: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFeedback({
        ...filters,
        page: 1,
        limit: 1000,
      });
      
      // Calculate analytics from feedback data
      const feedbackData = response.data || [];
      const analytics = calculateAnalytics(feedbackData);
      setAnalytics(analytics);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load analytics");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (feedbackData) => {
    if (feedbackData.length === 0) {
      return {
        totalFeedback: 0,
        averageNPS: 0,
        averageServiceQuality: 0,
        npsDistribution: { promoter: 0, passive: 0, detractor: 0 },
        serviceQualityDistribution: {},
      };
    }

    const totalFeedback = feedbackData.length;
    const averageNPS = (
      feedbackData.reduce((sum, f) => sum + (f.npsScore || 0), 0) / totalFeedback
    ).toFixed(1);
    const averageServiceQuality = (
      feedbackData.reduce((sum, f) => sum + (f.serviceQuality || 0), 0) / totalFeedback
    ).toFixed(1);

    const npsDistribution = {
      promoter: feedbackData.filter((f) => f.npsScore >= 9).length,
      passive: feedbackData.filter((f) => f.npsScore >= 7 && f.npsScore < 9).length,
      detractor: feedbackData.filter((f) => f.npsScore < 7).length,
    };

    return {
      totalFeedback,
      averageNPS,
      averageServiceQuality,
      npsDistribution,
    };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className={styles.loading}>Loading analytics...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!analytics) return <div className={styles.emptyState}>No data available</div>;

  const npsScore = (
    ((analytics.npsDistribution.promoter - analytics.npsDistribution.detractor) /
      analytics.totalFeedback) *
    100
  ).toFixed(1);

  return (
    <div className={styles.feedbackAnalytics}>
      <div className={styles.analyticsHeader}>
        <h2>Feedback Analytics</h2>
        <div className={styles.filters}>
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
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        {/* Total Feedback Card */}
        <div className={styles.analyticsCard}>
          <h3>Total Feedback</h3>
          <div className={styles.metricValue}>{analytics.totalFeedback}</div>
          <p className={styles.metricLabel}>Responses collected</p>
        </div>

        {/* Average NPS Card */}
        <div className={styles.analyticsCard}>
          <h3>Average NPS</h3>
          <div className={styles.metricValue}>{analytics.averageNPS}</div>
          <p className={styles.metricLabel}>Out of 10</p>
        </div>

        {/* NPS Score Card */}
        <div className={styles.analyticsCard}>
          <h3>NPS Score</h3>
          <div className={clsx(styles.metricValue, npsScore >= 0 ? styles.metricValuePositive : styles.metricValueNegative)}>
            {npsScore}%
          </div>
          <p className={styles.metricLabel}>Promoter - Detractor</p>
        </div>

        {/* Service Quality Card */}
        <div className={styles.analyticsCard}>
          <h3>Service Quality</h3>
          <div className={styles.metricValue}>{analytics.averageServiceQuality}</div>
          <p className={styles.metricLabel}>Out of 5</p>
        </div>
      </div>

      <div className={styles.analyticsCharts}>
        {/* NPS Distribution */}
        <div className={styles.chartContainer}>
          <h3>NPS Distribution</h3>
          <div className={styles.distributionBars}>
            <div className={styles.barItem}>
              <div className={styles.barLabel}>Promoter (9-10)</div>
              <div className={styles.barValue}>{analytics.npsDistribution.promoter}</div>
              <div className={styles.barPercentage}>
                {(
                  (analytics.npsDistribution.promoter / analytics.totalFeedback) *
                  100
                ).toFixed(0)}%
              </div>
            </div>
            <div className={styles.barItem}>
              <div className={styles.barLabel}>Passive (7-8)</div>
              <div className={styles.barValue}>{analytics.npsDistribution.passive}</div>
              <div className={styles.barPercentage}>
                {(
                  (analytics.npsDistribution.passive / analytics.totalFeedback) *
                  100
                ).toFixed(0)}%
              </div>
            </div>
            <div className={styles.barItem}>
              <div className={styles.barLabel}>Detractor (0-6)</div>
              <div className={styles.barValue}>{analytics.npsDistribution.detractor}</div>
              <div className={styles.barPercentage}>
                {(
                  (analytics.npsDistribution.detractor / analytics.totalFeedback) *
                  100
                ).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackAnalytics;
