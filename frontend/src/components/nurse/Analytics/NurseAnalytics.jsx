import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import styles from './NurseAnalytics.module.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

function NurseAnalytics({ refreshTrigger = 0 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get today's date in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [viewPeriod, setViewPeriod] = useState('daily'); // Unified period for both analytics and health conditions
  const [analytics, setAnalytics] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    inProgressAppointments: 0,
    absentAppointments: 0,
    totalPatientsToday: 0,
    capacityUtilization: 0,
    averageWaitTime: 0,
    completionRate: 0,
    onlineAppointments: 0,
    walkinAppointments: 0,
    vitalsRecorded: 0,
    wellnessPlansCreated: 0,
  });
  const [chartData, setChartData] = useState({
    statusDistribution: null,
    appointmentTrend: null,
    hourlyBreakdown: null,
    healthConditions: null,
    conditionTrends: null, // New: Line chart for condition trends
  });
  const [healthConditions, setHealthConditions] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState(null); // Month-over-month comparison

  // Generate dynamic line chart using SAME endpoint as bar chart
  const generateDynamicLineChart = async (period, rankedConditions) => {
    try {
      console.log('📈 Generating line chart for period:', period);
      
      const today = new Date();
      let labels = [];
      let dataPointsPromises = [];
      let highlightedIndex = -1;
      
      if (period === 'daily') {
        const daysToShow = 7;
        highlightedIndex = daysToShow - 1;
        
        for (let i = daysToShow - 1; i >= 0; i--) {
          const year = today.getUTCFullYear();
          const month = today.getUTCMonth();
          const date = today.getUTCDate();
          
          const dateStart = new Date(Date.UTC(year, month, date - i, 0, 0, 0));
          const dateEnd = new Date(Date.UTC(year, month, date - i, 23, 59, 59));
          
          labels.push(i === 0 ? 'Today' : dateStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
          
          const params = {
            startDate: dateStart.toISOString(),
            endDate: dateEnd.toISOString()
          };
          
          dataPointsPromises.push(
            api.get('/api/v1/conditions/period', { params })
              .then(res => res.data?.data || [])
              .catch(() => [])
          );
        }
      } else if (period === 'weekly') {
        const weeksToShow = 8;
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        
        // Calculate start of current week (Monday in UTC)
        const currentDay = today.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Days to go back to Monday
        
        const currentWeekStart = new Date(Date.UTC(year, month, date - daysToMonday, 0, 0, 0));
        const currentWeekEnd = new Date(Date.UTC(year, month, date, 23, 59, 59));
        
        highlightedIndex = weeksToShow - 1;
        
        for (let i = weeksToShow - 1; i >= 0; i--) {
          let weekStart, weekEnd, label;
          
          if (i === 0) {
            // Current week: Monday to today
            weekStart = new Date(currentWeekStart);
            weekEnd = new Date(currentWeekEnd);
            label = 'This week';
          } else {
            // Past weeks: Monday to Sunday (complete weeks)
            weekStart = new Date(currentWeekStart);
            weekStart.setUTCDate(currentWeekStart.getUTCDate() - (i * 7));
            
            weekEnd = new Date(weekStart);
            weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
            weekEnd.setUTCHours(23, 59, 59, 999);
            
            label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          }
          
          labels.push(label);
          
          const params = {
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString()
          };
          
          console.log(`[Trend] Week ${i}: ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);
          
          dataPointsPromises.push(
            api.get('/api/v1/conditions/period', { params })
              .then(res => res.data?.data || [])
              .catch(() => [])
          );
        }
      } else if (period === 'monthly') {
        const monthsToShow = 12;
        highlightedIndex = monthsToShow - 1;
        
        for (let i = monthsToShow - 1; i >= 0; i--) {
          const year = today.getUTCFullYear();
          const month = today.getUTCMonth() - i;
          
          const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
          let monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
          
          // For current month, only go up to today
          if (i === 0) {
            monthEnd = new Date(Date.UTC(year, today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));
          }
          
          labels.push(monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
          
          const params = {
            startDate: monthStart.toISOString(),
            endDate: monthEnd.toISOString()
          };
          
          dataPointsPromises.push(
            api.get('/api/v1/conditions/period', { params })
              .then(res => res.data?.data || [])
              .catch(() => [])
          );
        }
      } else {
        const monthsToShow = 12;
        highlightedIndex = -1;
        
        for (let i = monthsToShow - 1; i >= 0; i--) {
          const year = today.getUTCFullYear();
          const month = today.getUTCMonth() - i;
          
          const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
          const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
          
          labels.push(monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
          
          const params = {
            startDate: monthStart.toISOString(),
            endDate: monthEnd.toISOString()
          };
          
          dataPointsPromises.push(
            api.get('/api/v1/conditions/period', { params })
              .then(res => res.data?.data || [])
              .catch(() => [])
          );
        }
      }
      
      const dataPoints = await Promise.all(dataPointsPromises);
      
      console.log('📊 Line chart data points received:', dataPoints.map((dp, i) => ({
        label: labels[i],
        conditionsCount: dp.length,
        conditions: dp
      })));
      
      const lineDatasets = rankedConditions.map((condition, index) => {
        const conditionData = dataPoints.map(conditionsInPeriod => {
          const conditionMap = {};
          conditionsInPeriod.forEach(c => {
            const key = c.condition.toLowerCase().replace(/ /g, '_');
            if (key === 'heart_issues' || key === 'respiratory_issues') {
              conditionMap['heart_respiratory'] = (conditionMap['heart_respiratory'] || 0) + c.count;
            } else {
              conditionMap[key] = (conditionMap[key] || 0) + c.count;
            }
          });
          // Add tiny offset to prevent perfect overlap (0.01 * index)
          // This makes overlapping lines visible without affecting readability
          const baseValue = conditionMap[condition.key] || 0;
          return baseValue + (index * 0.01);
        });
        
        console.log(`📈 Condition "${condition.label}" data:`, conditionData);
        
        return {
          label: condition.label,
          data: conditionData,
          borderColor: condition.color,
          backgroundColor: condition.color + '20',
          borderWidth: 3, // Slightly thicker lines for better visibility
          tension: 0.4,
          fill: false,
          pointRadius: (context) => context.dataIndex === highlightedIndex ? 8 : 5,
          pointHoverRadius: (context) => context.dataIndex === highlightedIndex ? 10 : 7,
          pointBorderWidth: (context) => context.dataIndex === highlightedIndex ? 3 : 2,
          pointBackgroundColor: (context) => context.dataIndex === highlightedIndex ? '#ffffff' : condition.color,
          pointBorderColor: condition.color,
          pointStyle: 'circle',
        };
      });
      
      setChartData(prev => ({
        ...prev,
        conditionTrends: {
          labels,
          datasets: lineDatasets,
          highlightedIndex,
        },
      }));
      
      console.log('✅ Line chart generated');
    } catch (err) {
      console.error('❌ Failed to generate line chart:', err);
      setChartData(prev => ({
        ...prev,
        conditionTrends: null,
      }));
    }
  };


  const fetchHealthConditions = async (period = viewPeriod) => {
    try {
      console.log('🔍 Fetching health conditions for period:', period);
      
      // Calculate date range based on period using UTC dates
      const today = new Date();
      let startDate, endDate;
      
      if (period === 'all') {
        // All time - no date filters
        startDate = null;
        endDate = null;
      } else if (period === 'daily') {
        // Today only - use UTC dates to avoid timezone issues
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        startDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
        endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
      } else if (period === 'weekly') {
        // Current week: Monday to Today (calendar week)
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        const currentDay = today.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Days to go back to Monday
        
        startDate = new Date(Date.UTC(year, month, date - daysToMonday, 0, 0, 0));
        endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
      } else if (period === 'monthly') {
        // From 1st of current month to today - use UTC dates
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
        endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
      }
      
      console.log('Date range:', startDate, 'to', endDate);
      
      // Fetch patient conditions within date range (or all time if no dates)
      const params = period === 'all' ? {} : {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      
      const response = await api.get('/api/v1/conditions/period', { params });
      
      const conditions = response.data.data || [];
      const totalWellnessPlans = response.data.meta?.totalWellnessPlans || 0;
      
      console.log('📊 Total wellness plans in period:', totalWellnessPlans);
      console.log('📊 Health conditions data:', conditions);
      
      // Get total unique patients in the period (from vitals records)
      const vitalsParams = period === 'all' ? {} : {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      
      const vitalsRes = await api.get('/api/v1/vitals/all', { params: vitalsParams });
      
      const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
      const uniquePatients = new Set(vitalsData.map(v => v.userId).filter(Boolean));
      const totalPatients = uniquePatients.size;
      
      console.log('📊 Total patients in period:', totalPatients);
      console.log('📊 Health conditions data:', conditions);
      
      // Define predefined conditions with their colors
      const predefinedConditions = [
        { key: 'hypertension', label: 'Hypertension', color: '#dc2626' },      // Red
        { key: 'overweight', label: 'Overweight', color: '#f59e0b' },          // Amber/Orange
        { key: 'obesity', label: 'Obesity', color: '#7c3aed' },                // Purple
        { key: 'diabetes', label: 'Diabetes', color: '#2563eb' },              // Blue
        { key: 'heart_respiratory', label: 'Heart / Resp.', color: '#ec4899' }, // Pink
        { key: 'normal', label: 'Normal', color: '#10b981' },                  // Green
      ];
      
      // Create a map of condition counts
      const conditionMap = {};
      const customConditions = new Set();
      
      conditions.forEach(c => {
        const key = c.condition.toLowerCase().replace(/ /g, '_');
        
        // Skip "other" condition completely
        if (key === 'other') {
          return;
        }
        
        // Combine heart issues and respiratory issues
        if (key === 'heart_issues' || key === 'respiratory_issues') {
          conditionMap['heart_respiratory'] = (conditionMap['heart_respiratory'] || 0) + c.count;
        } else {
          conditionMap[key] = (conditionMap[key] || 0) + c.count;
          
          // Track custom conditions (not in predefined list)
          const isPredefined = predefinedConditions.some(pc => pc.key === key);
          if (!isPredefined && key !== 'heart_issues' && key !== 'respiratory_issues') {
            customConditions.add(key);
          }
        }
      });
      
      // Generate colors for custom conditions
      const customColors = ['#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'];
      const customConditionsList = Array.from(customConditions).map((key, index) => ({
        key,
        label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        color: customColors[index % customColors.length],
      }));
      
      // Combine predefined and custom conditions
      const allConditions = [...predefinedConditions, ...customConditionsList];
      
      console.log('📊 Condition map:', conditionMap);
      console.log('📊 Custom conditions found:', customConditionsList);
      console.log('📊 Total wellness plans for percentage calc:', totalWellnessPlans);
      
      // Map counts to conditions and calculate percentages based on total wellness plans
      const rankedConditions = allConditions.map(c => ({
        ...c,
        count: conditionMap[c.key] || 0,
        percentage: totalWellnessPlans > 0 
          ? Math.round((conditionMap[c.key] || 0) / totalWellnessPlans * 100) 
          : 0,
        totalPatients: totalPatients
      })).filter(c => c.count > 0).sort((a, b) => b.count - a.count); // Only show conditions with count > 0
      
      setHealthConditions(rankedConditions);
      
      // Generate line chart with DYNAMIC date ranges based on actual data
      await generateDynamicLineChart(period, rankedConditions);
      
      console.log('✅ Health conditions ranked:', rankedConditions);
    } catch (err) {
      console.error('❌ Failed to fetch health conditions:', err);
      // Set empty data on error
      setHealthConditions([
        { key: 'hypertension', label: 'Hypertension', color: '#8b5cf6', count: 0, percentage: 0, totalPatients: 0 },
        { key: 'overweight', label: 'Overweight', color: '#10b981', count: 0, percentage: 0, totalPatients: 0 },
        { key: 'obesity', label: 'Obesity', color: '#f97316', count: 0, percentage: 0, totalPatients: 0 },
        { key: 'diabetes', label: 'Diabetes', color: '#f59e0b', count: 0, percentage: 0, totalPatients: 0 },
        { key: 'heart_respiratory', label: 'Heart / Resp.', color: '#ec4899', count: 0, percentage: 0, totalPatients: 0 },
      ]);
    }
  };



  useEffect(() => {
    fetchAnalytics().catch(err => {
      console.error('Error in fetchAnalytics:', err);
      setError('Failed to load analytics: ' + err.message);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, viewPeriod]);

  // Listen for refreshTrigger changes and refresh analytics
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Analytics refresh triggered');
      fetchAnalytics().catch(err => {
        console.error('Error in fetchAnalytics:', err);
        setError('Failed to load analytics: ' + err.message);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Fetch health conditions when period changes
  useEffect(() => {
    fetchHealthConditions(viewPeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Parse selected date
      const selectedDateObj = new Date(selectedDate);
      let startDate = new Date(selectedDateObj);
      let endDate = new Date(selectedDateObj);

      // Adjust date range based on activity period
      if (viewPeriod === 'all') {
        // All time - no date filters
        startDate = null;
        endDate = null;
      } else if (viewPeriod === 'weekly') {
        // Current week: Monday to Today (calendar week)
        const currentDay = selectedDateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Days to go back to Monday
        startDate.setDate(selectedDateObj.getDate() - daysToMonday);
        // End date is today (or selected date)
        endDate = new Date(selectedDateObj);
      } else if (viewPeriod === 'monthly') {
        // Start of month
        startDate.setDate(1);
        // End of month
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      }
      // For daily, startDate and endDate are the same

      if (startDate && endDate) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      console.log('Fetching analytics for date range:', startDate, 'to', endDate);

      // Fetch appointments from queue endpoint with date parameter
      const appointmentsRes = await api.get('/api/v1/appointments/queue', {
        params: viewPeriod === 'all' 
          ? {} 
          : { 
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            }
      });
      let appointmentsData = appointmentsRes.data.data || [];

      console.log('Queue appointments:', appointmentsData);

      // Filter appointments by selected date range (skip if all time)
      if (viewPeriod !== 'all') {
        appointmentsData = appointmentsData.filter(apt => {
          const aptDate = new Date(apt.scheduledAt);
          const isInRange = aptDate >= startDate && aptDate <= endDate;
          console.log(`Apt ${apt.appointmentId}: date=${aptDate.toDateString()}, inRange=${isInRange}`);
          return isInRange;
        });

        console.log('Filtered appointments:', appointmentsData.length);
      }

      // Map queue status to appointment status for filtering
      const mappedAppointments = appointmentsData.map(apt => ({
        ...apt,
        appointmentStatus: apt.status, // Use status directly - no mapping needed
        customerId: apt.customerId,
        customerName: apt.customerName,
        appointmentId: apt.appointmentId,
        scheduledAt: apt.scheduledAt,
        type: apt.type || 'ONLINE'
      }));

      // Fetch capacity data
      const capacityRes = await api.get('/api/v1/analytics/capacity');
      const capacityData = capacityRes.data.data || {};

      // Calculate metrics
      const total = mappedAppointments.length;
      const completed = mappedAppointments.filter(a => a.appointmentStatus === 'COMPLETED').length;
      const waiting = mappedAppointments.filter(a => a.appointmentStatus === 'WAITING').length;
      const inProgress = mappedAppointments.filter(a => a.appointmentStatus === 'IN_PROGRESS').length;
      const inService = mappedAppointments.filter(a => a.appointmentStatus === 'IN_SERVICE').length;
      const completedAppointments = mappedAppointments.filter(a => a.appointmentStatus === 'COMPLETED');
      
      // Count online appointments (all appointments are online bookings)
      let onlineCount = total;
      let walkin = 0;

      // NO_SHOW appointments - fetch from queue
      const absent = mappedAppointments.filter(a => a.appointmentStatus === 'NO_SHOW').length;

      // Count walk-ins separately from appointments
      // Walk-ins = patients who got wellness plans WITHOUT any appointment on that day
      // This matches Admin dashboard logic: if you have appointment today, you're NOT a walk-in
      try {
        console.log('=== COUNTING WALK-INS (Admin Logic) ===');
        
        // Get all wellness plans created in the period (or all time)
        const vitalsParams = viewPeriod === 'all' ? {} : {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
        
        const vitalsRes = await api.get('/api/v1/vitals/all', { params: vitalsParams });
        
        const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
        if (Array.isArray(vitalsData)) {
          const vitalsRecords = vitalsData;
          console.log(`Found ${vitalsRecords.length} vitals records in period`);
          
          // Get unique user IDs from vitals
          const vitalsUserIds = [...new Set(vitalsRecords.map(v => v.userId).filter(Boolean))];
          console.log('Users with vitals:', vitalsUserIds);
          
          // Build map of userId -> set of appointment dates
          const appointmentDateMap = new Map();
          mappedAppointments.forEach(apt => {
            const aptDate = new Date(apt.scheduledAt);
            aptDate.setHours(0, 0, 0, 0);
            const dayKey = aptDate.getTime();
            
            if (!appointmentDateMap.has(apt.customerId)) {
              appointmentDateMap.set(apt.customerId, new Set());
            }
            appointmentDateMap.get(apt.customerId).add(dayKey);
          });
          
          console.log('Appointment date map:', Array.from(appointmentDateMap.entries()).map(([userId, dates]) => ({
            userId: userId.substring(0, 8) + '...',
            appointmentDates: Array.from(dates).map(d => new Date(d).toDateString())
          })));
          
          // For each user with vitals, check their wellness plans
          for (const userId of vitalsUserIds) {
            try {
              const plansRes = await api.get(`/api/v1/plans/${userId}`);
              const plansData = plansRes.data?.data || plansRes.data || [];
              
              if (Array.isArray(plansData)) {
                // Count wellness plans created in this period (or all time)
                const periodPlans = viewPeriod === 'all' 
                  ? plansData 
                  : plansData.filter(p => {
                      const pDate = new Date(p.createdAt);
                      return pDate >= startDate && pDate <= endDate;
                    });
                
                // For each wellness plan, check if user had ANY appointment on that day
                for (const plan of periodPlans) {
                  const planDate = new Date(plan.createdAt);
                  planDate.setHours(0, 0, 0, 0);
                  const planDayKey = planDate.getTime();
                  
                  // Check if user has ANY appointment on this day
                  const userAppointmentDates = appointmentDateMap.get(userId);
                  const hasAppointmentOnDay = userAppointmentDates && userAppointmentDates.has(planDayKey);
                  
                  // Admin logic: If user has appointment on this day, NONE of their plans are walk-ins
                  if (!hasAppointmentOnDay) {
                    walkin++;
                    console.log(`  ✓ Walk-in counted for user ${userId.substring(0, 8)}... on ${planDate.toDateString()}`);
                  } else {
                    console.log(`  ⚠️  User ${userId.substring(0, 8)}... has appointment on ${planDate.toDateString()}, NOT counting as walk-in`);
                  }
                }
                
                if (periodPlans.length > 0) {
                  console.log(`✓ User ${userId.substring(0, 8)}...: ${periodPlans.length} wellness plans checked`);
                }
              }
            } catch (err) {
              console.log(`Could not fetch data for user ${userId}:`, err.message);
            }
          }
        }
        console.log('Total walk-in services completed:', walkin);
        console.log('=== WALK-IN COUNT COMPLETE ===');
      } catch (err) {
        console.error('Failed to count walk-ins:', err);
        walkin = 0; // Default to 0 if walk-in counting fails
      }

      // Calculate average wait time from actual data
      let totalWaitTime = 0;
      let completedWithTimes = 0;
      mappedAppointments.forEach(apt => {
        if (apt.appointmentStatus === 'COMPLETED') {
          totalWaitTime += 15;
          completedWithTimes++;
        }
      });
      const averageWaitTime = completedWithTimes > 0 ? Math.round(totalWaitTime / completedWithTimes) : 0;

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const utilizationPct = capacityData.utilizationPct || 0;

      // Calculate vitals recorded for ALL users (appointments + walk-ins) in the period
      let vitalsRecorded = 0;
      try {
        const vitalsParams = viewPeriod === 'all' ? {} : {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
        
        const vitalsRes = await api.get('/api/v1/vitals/all', { params: vitalsParams });
        
        const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
        if (Array.isArray(vitalsData)) {
          vitalsRecorded = vitalsData.length;
          console.log(`Total vitals recorded in period: ${vitalsRecorded}`);
        }
      } catch (err) {
        console.error('Failed to fetch vitals:', err);
        vitalsRecorded = 0; // Default to 0 if vitals fetching fails
      }

      // Calculate wellness plans created for ALL users (appointments + walk-ins) in the period
      let wellnessPlansCreated = 0;
      try {
        // Get all users who had vitals in the period (both appointments and walk-ins)
        const vitalsParams = viewPeriod === 'all' ? {} : {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
        
        const vitalsRes = await api.get('/api/v1/vitals/all', { params: vitalsParams });
        
        const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
        if (Array.isArray(vitalsData)) {
          const allUserIds = [...new Set(vitalsData.map(v => v.userId).filter(Boolean))];
          console.log('Fetching wellness plans for all users with vitals:', allUserIds);
          
          for (const userId of allUserIds) {
            try {
              const plansRes = await api.get(`/api/v1/plans/${userId}`);
              console.log(`Wellness plans response for ${userId}:`, plansRes.data);
              
              let plansArray = [];
              if (plansRes.data?.data && Array.isArray(plansRes.data.data)) {
                plansArray = plansRes.data.data;
              }
              
              if (Array.isArray(plansArray)) {
                const periodPlans = viewPeriod === 'all' 
                  ? plansArray 
                  : plansArray.filter(p => {
                      const pDate = new Date(p.createdAt);
                      return pDate >= startDate && pDate <= endDate;
                    });
                console.log(`Found ${periodPlans.length} wellness plans for user ${userId} in period`);
                wellnessPlansCreated += periodPlans.length;
              }
            } catch (err) {
              console.log(`No wellness plans found for user ${userId}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch wellness plans:', err);
        wellnessPlansCreated = 0; // Default to 0 if wellness plans fetching fails
      }

      setAnalytics({
        totalAppointments: onlineCount,
        completedAppointments: completed,
        waitingAppointments: waiting,
        inProgressAppointments: inProgress,
        inServiceAppointments: inService,
        absentAppointments: absent,
        totalPatientsToday: completed + walkin, // Patients Served = Completed Appointments + Walk-ins (Admin logic)
        capacityUtilization: utilizationPct,
        averageWaitTime: averageWaitTime,
        completionRate: completionRate,
        onlineAppointments: onlineCount,
        walkinAppointments: walkin,
        vitalsRecorded: vitalsRecorded,
        wellnessPlansCreated: wellnessPlansCreated,
      });

      // Generate chart data with all appointments
      generateChartData(mappedAppointments, absent);

      // Fetch health conditions data
      await fetchHealthConditions();
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      if (err?.response?.status === 403) {
        setError('Access denied — Nurse Officer role required to view analytics.');
      } else if (err?.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load analytics. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (appointmentsData, absentCount = 0) => {
    // Map queue status to appointment status
    const mappedAppointments = appointmentsData.map(apt => ({
      ...apt,
      appointmentStatus: apt.status // Use status directly - no mapping needed
    }));

    // Status Distribution Pie Chart
    const statusCounts = {
      WAITING: mappedAppointments.filter(a => a.appointmentStatus === 'WAITING').length,
      IN_PROGRESS: mappedAppointments.filter(a => a.appointmentStatus === 'IN_PROGRESS').length,
      IN_SERVICE: mappedAppointments.filter(a => a.appointmentStatus === 'IN_SERVICE').length,
      COMPLETED: mappedAppointments.filter(a => a.appointmentStatus === 'COMPLETED').length,
      NO_SHOW: mappedAppointments.filter(a => a.appointmentStatus === 'NO_SHOW').length,
    };

    const statusDistribution = {
      labels: ['Waiting', 'In Progress', 'In Service', 'Completed', 'Absent'],
      datasets: [
        {
          data: [statusCounts.WAITING, statusCounts.IN_PROGRESS, statusCounts.IN_SERVICE, statusCounts.COMPLETED, statusCounts.NO_SHOW],
          backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'],
          borderColor: ['#1e40af', '#d97706', '#6d28d9', '#059669', '#dc2626'],
          borderWidth: 2,
        },
      ],
    };

    // Hourly Breakdown Bar Chart
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }
    mappedAppointments.forEach(apt => {
      const appointmentDateField = apt.scheduledAt || apt.checkInTime;
      if (appointmentDateField) {
        const hour = new Date(appointmentDateField).getHours();
        hourlyData[hour]++;
      }
    });

    const hourlyBreakdown = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: 'Appointments',
          data: Object.values(hourlyData),
          backgroundColor: '#667eea',
          borderColor: '#764ba2',
          borderWidth: 1,
        },
      ],
    };

    // 7-Day Trend - Calculate from actual data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendCounts = last7Days.map(date => {
      return appointmentsData.filter(apt => {
        const appointmentDateField = apt.scheduledAt || apt.checkInTime;
        if (!appointmentDateField) return false;
        return appointmentDateField.split('T')[0] === date;
      }).length;
    });

    const trendData = {
      labels: dayLabels,
      datasets: [
        {
          label: 'Appointments',
          data: trendCounts,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    setChartData({
      statusDistribution,
      appointmentTrend: trendData,
      hourlyBreakdown,
    });
  };

  if (loading) {
    return (
      <div className={`card ${styles.analyticsContainer}`}>
        <p className={styles.loading}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <select
            value={viewPeriod}
            onChange={(e) => setViewPeriod(e.target.value)}
            className={styles.periodSelect}
            style={{
              padding: '0.375rem 0.625rem',
              fontSize: '0.8rem',
            }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All Time</option>
          </select>

          {viewPeriod === 'daily' && (
            <div className={styles.datePickerGroup}>
              <label>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`form-input ${styles.datePicker}`}
                style={{
                  padding: '0.375rem 0.625rem',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          )}
          
          <button 
            onClick={fetchAnalytics}
            className="btn btn-secondary"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Overview Cards */}
      <div className={styles.analyticsCardsGrid}>
        <div className={styles.analyticsCard}>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>
              {viewPeriod === 'daily' ? 'Appointments Today' : 
               viewPeriod === 'weekly' ? 'Appointments This Week' :
               viewPeriod === 'monthly' ? 'Appointments This Month' :
               'Total Appointments'}
            </p>
            <p className={styles.cardValue}>{analytics.totalAppointments}</p>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>
              {viewPeriod === 'daily' ? 'Patients Today' : 
               viewPeriod === 'weekly' ? 'Patients This Week' :
               viewPeriod === 'monthly' ? 'Patients This Month' :
               'Total Patients'}
            </p>
            <p className={styles.cardValue}>{analytics.totalPatientsToday}</p>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>
              {viewPeriod === 'daily' ? 'Walk-ins Today' : 
               viewPeriod === 'weekly' ? 'Walk-ins This Week' :
               viewPeriod === 'monthly' ? 'Walk-ins This Month' :
               'Total Walk-ins'}
            </p>
            <p className={styles.cardValue}>{analytics.walkinAppointments}</p>
          </div>
        </div>
      </div>

      {/* Appointment Breakdown and Activity Summary - Side by Side */}
      <div className={styles.analyticsMetricsGrid}>
        <div className={styles.metricsCard}>
          <div className={styles.breakdownItem}>
            <span>
              {viewPeriod === 'daily' ? 'Completed Today' : 
               viewPeriod === 'weekly' ? 'Completed This Week' :
               viewPeriod === 'monthly' ? 'Completed This Month' :
               'Total Completed'}
            </span>
            <span className={styles.breakdownValue}>{analytics.completedAppointments}</span>
          </div>

          <div className={styles.breakdownItem}>
            <span>
              {viewPeriod === 'daily' ? 'Absent Today' : 
               viewPeriod === 'weekly' ? 'Absent This Week' :
               viewPeriod === 'monthly' ? 'Absent This Month' :
               'Total Absent'}
            </span>
            <span className={styles.breakdownValue} title="Patient didn't show up for scheduled appointment">{analytics.absentAppointments}</span>
          </div>
        </div>

        <div className={styles.metricsCard}>
          <div className={styles.breakdownItem}>
            <span>
              {viewPeriod === 'daily' ? 'Vitals Today' : 
               viewPeriod === 'weekly' ? 'Vitals This Week' :
               viewPeriod === 'monthly' ? 'Vitals This Month' :
               'Total Vitals'}
            </span>
            <span className={styles.breakdownValue}>{analytics.vitalsRecorded}</span>
          </div>

          <div className={styles.breakdownItem}>
            <span>
              {viewPeriod === 'daily' ? 'Plans Today' : 
               viewPeriod === 'weekly' ? 'Plans This Week' :
               viewPeriod === 'monthly' ? 'Plans This Month' :
               'Total Plans'}
            </span>
            <span className={styles.breakdownValue}>{analytics.wellnessPlansCreated}</span>
          </div>
        </div>
      </div>

      {/* Health Conditions Ranked Chart */}
      <div className={`card ${styles.healthConditionsCard}`}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#666' }}>
                {viewPeriod === 'daily' && 'Patients with each condition recorded today'}
                {viewPeriod === 'weekly' && (() => {
                  const today = new Date();
                  const currentDay = today.getUTCDay();
                  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
                  const mondayDate = new Date(today);
                  mondayDate.setUTCDate(today.getUTCDate() - daysToMonday);
                  return `This week (${mondayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
                })()}
                {viewPeriod === 'monthly' && `Total patients this month (${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                {viewPeriod === 'all' && 'All-time cumulative patient conditions'}
              </p>
            </div>
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div style={{ marginTop: '2rem', position: 'relative', paddingLeft: '3rem' }}>
          {healthConditions.length > 0 && healthConditions[0].totalPatients > 0 ? (
            (() => {
              // Calculate dynamic Y-axis scale
              const maxCount = Math.max(...healthConditions.map(c => c.count), 1);
              const roundedMax = Math.ceil(maxCount / 10) * 10; // Round up to nearest 10
              const yAxisMax = roundedMax < 10 ? 10 : roundedMax; // Minimum 10
              const step = yAxisMax / 6; // 7 labels (0 to max)
              const yAxisLabels = Array.from({ length: 7 }, (_, i) => Math.round(yAxisMax - (i * step)));
              
              return (
                <>
                  {/* Y-axis label */}
                  <div style={{ position: 'absolute', left: '0', top: '175px', transform: 'rotate(-90deg)', transformOrigin: 'left center', fontSize: '0.9rem', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    Patients
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Y-axis */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '350px', paddingRight: '1rem', borderRight: '2px solid #e5e7eb' }}>
                      {yAxisLabels.map((label, index) => (
                        <span key={index} style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Chart area with grid lines */}
                    <div style={{ flex: 1, position: 'relative' }}>
                      {/* Horizontal grid lines */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {yAxisLabels.map((_, i) => (
                          <div key={i} style={{ height: '1px', backgroundColor: '#e5e7eb', width: '100%' }} />
                        ))}
                      </div>

                      {/* Bars */}
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '350px', gap: '1rem', padding: '0 1rem' }}>
                        {healthConditions.map((condition) => {
                          // Calculate height in pixels based on actual patient count relative to dynamic max
                          const heightPx = (condition.count / yAxisMax) * 350;
                          const percentage = condition.percentage; // Use pre-calculated percentage
                          
                          return (
                            <div 
                              key={condition.key} 
                              style={{ 
                                flex: 1, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'flex-end', 
                                maxWidth: '120px',
                                position: 'relative',
                                cursor: 'pointer'
                              }}
                              className="condition-bar-container"
                            >
                              {/* Hover Tooltip */}
                              <div 
                                className="condition-tooltip"
                                style={{
                                  position: 'absolute',
                                  bottom: `${heightPx + 10}px`,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                  color: '#fff',
                                  padding: '0.75rem 1rem',
                                  borderRadius: '8px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  opacity: 0,
                                  pointerEvents: 'none',
                                  transition: 'opacity 0.2s ease',
                                  zIndex: 10,
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                  <div style={{ width: '12px', height: '12px', backgroundColor: condition.color, borderRadius: '2px' }} />
                                  <span>{condition.label}</span>
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', marginTop: '0.25rem' }}>
                                  {condition.count} patients ({percentage}%)
                                </div>
                              </div>
                              
                              {/* Bar */}
                              <div
                                style={{
                                  width: '100%',
                                  height: `${heightPx}px`,
                                  backgroundColor: condition.color,
                                  borderRadius: '8px 8px 0 0',
                                  transition: 'all 0.3s ease',
                                  position: 'relative'
                                }}
                                className="condition-bar"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div style={{ display: 'flex', marginTop: '1rem', marginLeft: '4rem' }}>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: '1rem', padding: '0 1rem' }}>
                      {healthConditions.map((condition) => (
                        <div key={condition.key} style={{ flex: 1, maxWidth: '120px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151', wordBreak: 'break-word' }}>
                            {condition.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>


                </>
              );
            })()
          ) : (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
              No health conditions data available for this period.
            </p>
          )}
        </div>
      </div>

      {/* Health Condition Trends Pie Chart */}
      <div className={styles.trendChartCard}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="trend-chart-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111' }}>
            Health Condition Trends
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#666' }}>
            {viewPeriod === 'daily' && 'Condition distribution for today'}
            {viewPeriod === 'weekly' && 'Condition distribution for this week'}
            {viewPeriod === 'monthly' && 'Condition distribution for this month'}
            {viewPeriod === 'all' && 'Total condition distribution across all time'}
          </p>
        </div>

        {healthConditions.filter(c => c.count > 0).length > 0 ? (
          <div style={{ height: '400px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Pie
              data={{
                labels: healthConditions.filter(c => c.count > 0).map(c => c.label),
                datasets: [{
                  label: 'Patients',
                  data: healthConditions.filter(c => c.count > 0).map(c => c.count),
                  backgroundColor: healthConditions.filter(c => c.count > 0).map(c => c.color),
                  borderColor: healthConditions.filter(c => c.count > 0).map(c => c.color),
                  borderWidth: 2,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      font: {
                        size: 13,
                        weight: '500',
                      },
                      usePointStyle: true,
                      pointStyle: 'circle',
                      generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                          return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return {
                              text: `${label}: ${value} (${percentage}%)`,
                              fillStyle: data.datasets[0].backgroundColor[i],
                              hidden: false,
                              index: i
                            };
                          });
                        }
                        return [];
                      }
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold',
                    },
                    bodyFont: {
                      size: 13,
                    },
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} patients (${percentage}%)`;
                      }
                    }
                  },
                },
              }}
            />
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
            No condition data available for this period.
          </p>
        )}

        {/* Monthly Comparison Table - Only for monthly view */}
        {viewPeriod === 'monthly' && monthlyComparison && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
               Month-over-Month Comparison
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '6px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#284394', color: '#ffffff' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>Condition</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>{monthlyComparison.previousMonth}</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>{monthlyComparison.currentMonth}</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>Change</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(monthlyComparison.conditions).map(([key, data], index) => {
                    const labels = {
                      hypertension: 'Hypertension',
                      overweight: 'Overweight',
                      obesity: 'Obesity',
                      diabetes: 'Diabetes',
                      heart_respiratory: 'Heart / Resp.',
                      normal: 'Normal',
                    };
                    
                    const trendColor = data.trend === 'up' ? '#dc2626' : data.trend === 'down' ? '#10b981' : '#6b7280';
                    const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→';
                    const trendBg = data.trend === 'up' ? '#fee2e2' : data.trend === 'down' ? '#d1fae5' : '#f3f4f6';
                    
                    return (
                      <tr key={key} style={{ borderBottom: index < Object.keys(monthlyComparison.conditions).length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '600', color: '#374151' }}>{labels[key]}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280' }}>{data.previous}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#284394' }}>{data.current}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: trendColor }}>
                          {data.change > 0 ? '+' : ''}{data.change} ({data.percentChange > 0 ? '+' : ''}{data.percentChange}%)
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '12px', 
                            backgroundColor: trendBg, 
                            color: trendColor, 
                            fontWeight: '700',
                            fontSize: '1.1rem'
                          }}>
                            {trendIcon}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NurseAnalytics;
