/* ========================================
   PATIENT MANAGEMENT PAGE (TYPESCRIPT)
   Ethiopian Federal Healthcare Platform
   Enterprise Patient Operations
   ======================================== */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, UserPlus, Filter, Download, RefreshCw, User, Calendar, Activity } from 'lucide-react';
import { DataTable } from '@/components/data';
import { Button, Input, Select, Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/components/feedback';
import api from '../../services/api';
import type { Patient, PaginationParams } from '@/types/api';

/* ========================================
   TYPES
   ======================================== */

interface PatientFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  riskLevel: 'all' | 'low' | 'medium' | 'high' | 'critical';
  hasConditions: 'all' | 'yes' | 'no';
  center: string;
}

/* ========================================
   COMPONENT
   ======================================== */

const PatientManagement: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  // State
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'all',
    riskLevel: 'all',
    hasConditions: 'all',
    center: 'all',
  });
  
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
  });

  // Fetch patients
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', filters, pagination],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.riskLevel !== 'all' && { riskLevel: filters.riskLevel }),
        ...(filters.hasConditions !== 'all' && { hasConditions: filters.hasConditions }),
        ...(filters.center !== 'all' && { center: filters.center }),
      });
      
      const response = await api.get(`/api/v1/patients?${params.toString()}`);
      return response.data.data;
    },
  });

  // Fetch centers for filter
  const { data: centers } = useQuery({
    queryKey: ['centers'],
    queryFn: async () => {
      const response = await api.get('/api/v1/centers');
      return response.data.data || [];
    },
  });

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof PatientFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/v1/patients/export', {
        responseType: 'blob',
        params: filters,
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patients-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      success('Patient data exported successfully');
    } catch (err) {
      showError('Failed to export patient data');
    }
  };

  const handleBulkExport = (selectedPatients: Patient[]) => {
    // Convert selected patients to CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Center', 'Risk Level', 'Status'];
    const rows = selectedPatients.map(p => [
      p.displayId || p.id,
      p.fullName,
      p.email,
      p.phoneNumber || '',
      p.center?.name || '',
      p.riskLevel || 'low',
      p.status || 'active',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `selected-patients-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    success(`Exported ${selectedPatients.length} patients`);
  };

  const handleBulkStatusChange = async (selectedPatients: Patient[]) => {
    const newStatus = window.prompt('Enter new status (active/inactive):');
    if (!newStatus || !['active', 'inactive'].includes(newStatus.toLowerCase())) {
      showError('Invalid status');
      return;
    }

    try {
      await api.patch('/api/v1/patients/bulk-update', {
        patientIds: selectedPatients.map(p => p.id),
        status: newStatus.toLowerCase(),
      });
      success(`Updated ${selectedPatients.length} patients`);
      refetch();
    } catch (err) {
      showError('Failed to update patients');
    }
  };

  const handleRowClick = (patient: Patient) => {
    navigate(`/admin/patients/${patient.id}`);
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  // Table columns
  const columns = [
    {
      key: 'displayId',
      header: 'Patient ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-semibold text-primary-600">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Full Name',
      sortable: true,
      render: (value: string, row: Patient) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'Phone',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'center',
      header: 'Center',
      render: (value: any) => (
        <span className="text-sm text-gray-700">{value?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'conditions',
      header: 'Conditions',
      render: (value: any[]) => (
        <div className="flex items-center gap-1">
          {value && value.length > 0 ? (
            <>
              <Badge variant="info" size="sm">{value.length}</Badge>
              <span className="text-xs text-gray-500">conditions</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getRiskBadgeVariant(value)} size="sm">
          {value || 'Low'}
        </Badge>
      ),
    },
    {
      key: 'lastVisit',
      header: 'Last Visit',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)} size="sm">
          {value || 'Active'}
        </Badge>
      ),
    },
  ];

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <EmptyState
          icon={<Activity className="w-12 h-12" />}
          title="Failed to load patients"
          description="There was an error loading patient data. Please try again."
          action={
            <Button onClick={() => refetch()} variant="primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  const patients = data?.patients || [];
  const totalCount = data?.total || 0;

  return (
    <div className="patient-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and monitor patient records across all centers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExport}
            disabled={patients.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/patients/new')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                type="text"
                placeholder="Search by name, ID, phone, or email..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>

            {/* Risk Level Filter */}
            <Select
              value={filters.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical</option>
            </Select>

            {/* Center Filter */}
            <Select
              value={filters.center}
              onChange={(e) => handleFilterChange('center', e.target.value)}
            >
              <option value="all">All Centers</option>
              {centers?.map((center: any) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Active Filters Summary */}
          {(filters.search || filters.status !== 'all' || filters.riskLevel !== 'all' || filters.center !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              {filters.search && (
                <Badge variant="info" size="sm">Search: {filters.search}</Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="info" size="sm">Status: {filters.status}</Badge>
              )}
              {filters.riskLevel !== 'all' && (
                <Badge variant="info" size="sm">Risk: {filters.riskLevel}</Badge>
              )}
              {filters.center !== 'all' && (
                <Badge variant="info" size="sm">Center</Badge>
              )}
              <button
                onClick={() => setFilters({
                  search: '',
                  status: 'all',
                  riskLevel: 'all',
                  hasConditions: 'all',
                  center: 'all',
                })}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {data?.stats?.active || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {data?.stats?.highRisk || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-error-600 mt-1">
                {data?.stats?.critical || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Patient Table */}
      <Card>
        {patients.length === 0 ? (
          <EmptyState
            icon={<User className="w-12 h-12" />}
            title="No patients found"
            description="No patients match your current filters. Try adjusting your search criteria."
            action={
              filters.search || filters.status !== 'all' || filters.riskLevel !== 'all' ? (
                <Button
                  onClick={() => setFilters({
                    search: '',
                    status: 'all',
                    riskLevel: 'all',
                    hasConditions: 'all',
                    center: 'all',
                  })}
                  variant="secondary"
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            data={patients}
            columns={columns}
            onRowClick={handleRowClick}
            selectable
            bulkActions={[
              {
                label: 'Export Selected',
                icon: <Download className="w-4 h-4 mr-1" />,
                onClick: handleBulkExport,
                variant: 'secondary',
              },
              {
                label: 'Change Status',
                onClick: handleBulkStatusChange,
                variant: 'secondary',
              },
            ]}
            exportable
            onExport={handleBulkExport}
            columnControls
            densityControl
            stickyHeader
            pagination={{
              currentPage: pagination.page,
              pageSize: pagination.limit,
              totalItems: totalCount,
              onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
              onPageSizeChange: (limit) => setPagination({ page: 1, limit }),
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default PatientManagement;

