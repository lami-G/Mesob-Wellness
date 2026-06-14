import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import QuickHistoryModal from '../shared/QuickHistoryModal';
import styles from './LiveQueuePanel.module.css';

function LiveQueuePanel({ refreshTrigger, onNavigateToHistory }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  // Refresh queue when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      console.log('🔄 Queue refresh triggered');
      fetchQueue();
    }
  }, [refreshTrigger]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching queue...');
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      const response = await api.get(`/api/v1/appointments/queue?date=${dateString}`);
      console.log('📋 Queue response:', response.data);
      
      const data = response.data.data;
      
      let queueList = [];
      if (Array.isArray(data)) {
        queueList = data;
      } else if (data && data.queue && Array.isArray(data.queue)) {
        queueList = data.queue;
      } else if (data && typeof data === 'object') {
        console.warn('⚠️ Unexpected data format:', data);
        queueList = [];
      }
      
      console.log(`✅ Queue loaded: ${queueList.length} appointments`);
      setQueue(queueList);
      setError('');
    } catch (err) {
      console.error('❌ Queue fetch error:', err);
      if (err?.response?.status === 403) {
        setError('Access denied — Nurse Officer role required to view the queue.');
      } else if (err?.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load queue. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredQueue = queue.filter(item => {
    const matchesSearch = 
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.appointmentId?.includes(searchTerm) ||
      item.customerId?.includes(searchTerm);
    
    if (filter === 'all') {
      return matchesSearch;
    }
    return matchesSearch && item.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      WAITING: styles.statusWaiting,
      IN_PROGRESS: styles.statusInProgress,
      IN_SERVICE: styles.statusInService,
      COMPLETED: styles.statusCompleted,
      NO_SHOW: styles.statusNoShow,
    };
    return colors[status] || styles.statusWaiting;
  };

  const getAppointmentType = (type) => {
    return type === 'ONLINE' ? 'Online' : 'Walk-in';
  };

  const handleSendEmail = async (appointmentId, customerName, customerEmail) => {
    try {
      await api.post(`/api/v1/appointments/${appointmentId}/send-reminder`, {
        type: 'email',
        email: customerEmail,
      });
      alert(`✅ Email reminder sent to ${customerEmail}`);
    } catch (err) {
      alert("❌ Failed to send email reminder");
      console.error(err);
    }
  };

  const handleViewDetails = (customerId, customerName) => {
    // Show quick history modal instead of navigating
    setSelectedCustomerForHistory({ customerId, customerName });
    setShowHistoryModal(true);
  };

  const handleViewFullDetails = () => {
    // Navigate to full history view
    if (onNavigateToHistory && selectedCustomerForHistory) {
      onNavigateToHistory({
        customerId: selectedCustomerForHistory.customerId,
        customerName: selectedCustomerForHistory.customerName,
      });
    }
  };

  return (
    <div className={`card ${styles.liveQueuePanel}`}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className={styles.queueControls}>
        <input
          type="text"
          placeholder="Search by name or appointment ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({queue.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'WAITING' ? styles.active : ''}`}
            onClick={() => setFilter('WAITING')}
          >
            Waiting ({queue.filter(q => q.status === 'WAITING').length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'IN_PROGRESS' ? styles.active : ''}`}
            onClick={() => setFilter('IN_PROGRESS')}
          >
            In Progress ({queue.filter(q => q.status === 'IN_PROGRESS').length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'IN_SERVICE' ? styles.active : ''}`}
            onClick={() => setFilter('IN_SERVICE')}
          >
            In Service ({queue.filter(q => q.status === 'IN_SERVICE').length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'COMPLETED' ? styles.active : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed ({queue.filter(q => q.status === 'COMPLETED').length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'NO_SHOW' ? styles.active : ''}`}
            onClick={() => setFilter('NO_SHOW')}
          >
            Absent ({queue.filter(q => q.status === 'NO_SHOW').length})
          </button>
        </div>
      </div>

      {loading && <p className={styles.loadingText}>Loading queue...</p>}

      {!loading && filteredQueue.length === 0 ? (
        <p className={styles.emptyText}>No customers in queue</p>
      ) : (
        <div className={styles.queueList}>
          {filteredQueue.map((item, idx) => (
            <div key={item.id || idx} className={`${styles.queueItem} ${getStatusColor(item.status)}`}>
              <div className={styles.queueItemHeader}>
                <span className={styles.queueNumber}>#{idx + 1}</span>
                <span className={styles.customerName}>{item.customerName}</span>
                <span className={styles.customerId}>
                  ID: {item.userId || item.customerId?.substring(0, 8) + '...'}
                </span>
                <span className={styles.appointmentType}>{getAppointmentType(item.type)}</span>
                <span className={`${styles.statusBadge} ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className={styles.queueItemDetails}>
                <p><strong>Appointment ID:</strong> {item.appointmentId?.substring(0, 12)}...</p>
                <p><strong>Check-in:</strong> {new Date(item.checkInTime).toLocaleTimeString()}</p>
                {item.reason && <p><strong>Reason:</strong> {item.reason}</p>}
              </div>

              <div className={styles.queueItemActions}>
                {/* Only show Send Email and View Details for WAITING and IN_PROGRESS */}
                {(item.status === 'WAITING' || item.status === 'IN_PROGRESS') && (
                  <>
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => handleSendEmail(item.appointmentId, item.customerName, item.customerEmail)}
                      title="Send email reminder to customer"
                    >
                      Send Email
                    </button>
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={() => handleViewDetails(item.customerId, item.customerName)}
                      title="View patient history"
                    >
                      View History
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        className={`btn btn-primary ${styles.btnRefresh}`}
        onClick={fetchQueue}
        disabled={loading}
      >
        Refresh Queue
      </button>

      {showHistoryModal && selectedCustomerForHistory && (
        <QuickHistoryModal
          customerId={selectedCustomerForHistory.customerId}
          customerName={selectedCustomerForHistory.customerName}
          onClose={() => setShowHistoryModal(false)}
          onViewDetails={handleViewFullDetails}
        />
      )}
    </div>
  );
}

export default LiveQueuePanel;
