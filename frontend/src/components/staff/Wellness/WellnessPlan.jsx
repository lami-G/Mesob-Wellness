import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import styles from "./WellnessPlan.module.css";

function normalizeGoals(goalsValue) {
  if (!goalsValue) return [];

  if (Array.isArray(goalsValue)) {
    return goalsValue
      .map((goal) => {
        if (typeof goal === "string") {
          return { title: goal, completed: false };
        }
        if (goal && typeof goal === "object") {
          return {
            title: goal.title || "",
            completed: Boolean(goal.completed),
          };
        }
        return { title: "", completed: false };
      })
      .filter((g) => g.title);
  }

  if (typeof goalsValue === "string") {
    return goalsValue
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const checked = line.startsWith("[x]");
        const raw = line.replace(/^\[[x ]\]\s*/i, "");
        return { title: raw, completed: checked };
      });
  }

  return [];
}

function normalizePlan(plan) {
  const goals = normalizeGoals(plan.goals);
  return {
    ...plan,
    title: plan.title || "Wellness Plan",
    description: plan.description || plan.planText || "",
    nutritionRecommendations: plan.nutritionRecommendations || null,
    exerciseRecommendations: plan.exerciseRecommendations || null,
    stressManagementAdvice: plan.stressManagementAdvice || null,
    goals,
  };
}

function WellnessPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchWellnessPlans();
  }, [user?.id]);

  const fetchWellnessPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/plans/${user.id}`);
      const data = response.data.data;
      setPlans(Array.isArray(data) ? data.map(normalizePlan) : []);
      setError("");
    } catch (err) {
      setPlans([]);
      setError("Failed to load wellness plans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkGoalComplete = async (planId, goalIndex) => {
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;

      const updatedGoals = [...(plan.goals || [])];
      updatedGoals[goalIndex] = {
        ...updatedGoals[goalIndex],
        completed: !updatedGoals[goalIndex].completed,
      };

      await api.put(`/api/v1/plans/${planId}`, {
        goals: updatedGoals,
      });

      fetchWellnessPlans();
    } catch (err) {
      setError("Failed to update goal");
    }
  };

  const getProgressPercentage = (plan) => {
    if (!plan.goals || plan.goals.length === 0) return 0;
    const completed = plan.goals.filter((g) => g.completed).length;
    return Math.round((completed / plan.goals.length) * 100);
  };

  const handleBackToHealthJourney = () => {
    navigate('/dashboard?tab=health');
  };

  return (
    <div className={clsx('card', styles.wellnessPlan)}>
      <div className={styles.wellnessPlanHeader}>
        <h2>🎯 Wellness Plans</h2>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBackToHealthJourney}
        >
          ← Back to Health Journey
        </button>
      </div>

      {error && <div className={clsx(styles.alert, styles.alertError)}>{error}</div>}

      {loading ? (
        <p className={styles.loadingText}>Loading wellness plans...</p>
      ) : plans.length === 0 ? (
        <p className={styles.emptyText}>
          No wellness plans assigned yet. Visit a nurse to get a personalized
          plan!
        </p>
      ) : (
        <div className={styles.plansList}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.planCard}>
              <div className={styles.planHeader}>
                <h3>{plan.title || "Wellness Plan"}</h3>
                <span
                  className={clsx(styles.planStatus, {
                    [styles.active]: plan.isActive,
                    [styles.inactive]: !plan.isActive
                  })}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {plan.description && (
                <p className={styles.planDescription}>{plan.description}</p>
              )}

              <div className={styles.planSections}>
                {plan.nutritionRecommendations && (
                  <div className={styles.planSection}>
                    <h4>Nutrition Recommendations</h4>
                    <p>{plan.nutritionRecommendations}</p>
                  </div>
                )}

                {plan.exerciseRecommendations && (
                  <div className={styles.planSection}>
                    <h4>Exercise Recommendations</h4>
                    <p>{plan.exerciseRecommendations}</p>
                  </div>
                )}

                {plan.stressManagementAdvice && (
                  <div className={styles.planSection}>
                    <h4>Stress Management</h4>
                    <p>{plan.stressManagementAdvice}</p>
                  </div>
                )}
              </div>

              {plan.goals && plan.goals.length > 0 && (
                <div className={styles.goalsSection}>
                  <h4>Goals & Progress</h4>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${getProgressPercentage(plan)}%` }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>
                    {plan.goals.filter((g) => g.completed).length} of{" "}
                    {plan.goals.length} goals completed
                  </p>

                  <div className={styles.goalsList}>
                    {plan.goals.map((goal, idx) => (
                      <div key={idx} className={styles.goalItem}>
                        <input
                          type="checkbox"
                          checked={goal.completed || false}
                          onChange={() => handleMarkGoalComplete(plan.id, idx)}
                          className={styles.goalCheckbox}
                        />
                        <span
                          className={clsx(styles.goalText, {
                            [styles.completed]: goal.completed
                          })}
                        >
                          {goal.title || goal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.duration && (
                <p className={styles.planDuration}>Duration: {plan.duration} days</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WellnessPlan;
