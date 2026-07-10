import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminServiceice";
import VitalModal from "./VitalModal
import styles from "./DataList.module.css";
import clsx from "clsx";

function VitalRecordsList() {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedVital, setSelectedVital] = useState(null);
  const [filters, setFilters] = useState({
    region: "",
    center: "",
    bmiCategory: "",
    bpCategory: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  useEffect(() => {
    fetchVitals();
  }, [page, filters]);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const response = await adminService.getVitals({
        ...filters,
        page,
        limit: 20,
      });
      setVitals(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load vitals");
      console.error("Error fetching vitals:", err);
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
      bmiCategory: "",
      bpCategory: "",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
    setPage(1);
  };

  const handleExport = () => {
    if (vitals.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Patient Name",
      "Weight (kg)",
      "Height (cm)",
      "BMI",
      "BP (Sys/Dia)",
      "Heart Rate",
      "Temperature (°C)",
      "O2 Saturation (%)",
      "Recorded Date",
    ];

    const rows = vitals.map((vital) => [
      vital.user?.fullName || "N/A",
      vital.weightKg?.toFixed(1) || "-",
      vital.heightCm?.toFixed(1) || "-",
      vital.bmi?.toFixed(1) || "-",
      vital.systolic && vital.diastolic ? `${vital.systolic}/${vital.diastolic}` : "-",
      vital.heartRate || "-",
      vital.temperature?.toFixed(1) || "-",
      vital.oxygenSaturation || "-",
      new Date(vital.recordedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vital-records-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className={styles.loading}>Loading vitals...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.dataList}>
      <VitalModal vital={selectedVital} onClose={() => setSelectedVital(null)} />
      
      <div className={styles.listHeader}>
        <h2>Vital Records</h2>
        <button className={styles.btnExport} onClick={handleExport}>Export</button>
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
          name="bmiCategory"
          value={filters.bmiCategory}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All BMI Categories</option>
          <option value="UNDERWEIGHT">Underweight</option>
          <option value="NORMAL">Normal</option>
          <option value="OVERWEIGHT">Overweight</option>
          <option value="OBESITY">Obesity</option>
        </select>
        <select
          name="bpCategory"
          value={filters.bpCategory}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="">All BP Categories</option>
          <option value="NORMAL">Normal</option>
          <option value="ELEVATED">Elevated</option>
          <option value="HYPERTENSION_STAGE_1">Hypertension Stage 1</option>
          <option value="HYPERTENSION_STAGE_2">Hypertension Stage 2</option>
          <option value="HYPERTENSIVE_CRISIS">Hypertensive Crisis</option>
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

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
              <th>BMI</th>
              <th>BP (Sys/Dia)</th>
              <th>Heart Rate</th>
              <th>Temperature</th>
              <th>O2 Sat</th>
              <th>Recorded At</th>
              <th>Actions</th>
            </tr>
          </thead>
        <tbody>
          {vitals.map((vital) => {
            const bmiCategoryClass = {
              NORMAL: styles.badgeNormal,
              UNDERWEIGHT: styles.badgeUnderweight,
              OVERWEIGHT: styles.badgeOverweight,
              OBESITY: styles.badgeObesity,
            }[vital.bmiCategory] || '';

            return (
              <tr key={vital.id}>
                <td>{vital.user?.fullName || "N/A"}</td>
                <td>{vital.weightKg?.toFixed(1) || "-"}</td>
                <td>{vital.heightCm?.toFixed(1) || "-"}</td>
                <td>
                  <span className={clsx(styles.badge, bmiCategoryClass)}>
                    {vital.bmi?.toFixed(1) || "-"}
                  </span>
                </td>
                <td>{vital.systolic && vital.diastolic ? `${vital.systolic}/${vital.diastolic}` : "-"}</td>
                <td>{vital.heartRate || "-"}</td>
                <td>{vital.temperature?.toFixed(1) || "-"}°C</td>
                <td>{vital.oxygenSaturation || "-"}%</td>
                <td>{new Date(vital.recordedAt).toLocaleDateString()}</td>
                <td>
                  <button className={styles.btnView} onClick={() => setSelectedVital(vital)}>View</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {vitals.length === 0 && (
        <div className={styles.emptyState}>No vital records found</div>
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
          disabled={vitals.length < 20}
          className={styles.btnNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default VitalRecordsList;
