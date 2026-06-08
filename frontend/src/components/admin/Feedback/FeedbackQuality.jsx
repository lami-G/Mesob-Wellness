import React, { useState } from "react";
import FeedbackList from "./FeedbackList";
import FeedbackAnalytics from "./FeedbackAnalytics";
import clsx from "clsx";
import styles from "./FeedbackQuality.module.css";

function FeedbackQuality({ baseFilters = {} }) {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className={styles.feedbackQualityPage}>
      <div className={styles.pageHeader}>
        <h1>Feedback & Quality Management</h1>
        <p>Monitor customer satisfaction and service quality</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={clsx(styles.tabButton, activeTab === "list" && styles.tabButtonActive)}
          onClick={() => setActiveTab("list")}
        >
          📋 Feedback List
        </button>
        <button
          className={clsx(styles.tabButton, activeTab === "analytics" && styles.tabButtonActive)}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "list" && <FeedbackList baseFilters={baseFilters} />}
        {activeTab === "analytics" && <FeedbackAnalytics />}
      </div>
    </div>
  );
}

export default FeedbackQuality;
