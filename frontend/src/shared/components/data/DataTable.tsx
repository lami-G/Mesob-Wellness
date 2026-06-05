/* ========================================
   DATA TABLE COMPONENT (ENHANCED)
   Ethiopian Federal Healthcare Platform
   Enterprise-Grade Table with Advanced Features
   ======================================== */

import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Search,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/utils';
import { Spinner, EmptyState, Button, Badge } from '../ui';

// ========================================
// TYPES
// ========================================

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: 'primary' | 'secondary' | 'error';
}

export type DensityMode = 'compact' | 'normal' | 'comfortable';

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowKey?: keyof T | ((row: T) => string);
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  // Enhanced features
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  pagination?: PaginationConfig;
  exportable?: boolean;
  onExport?: (data: T[]) => void;
  columnControls?: boolean;
  densityControl?: boolean;
  stickyHeader?: boolean;
  expandable?: boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;
  defaultDensity?: DensityMode;
}

// ========================================
// COMPONENT
// ========================================

export function DataTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  onRowClick,
  rowKey = 'id' as keyof T,
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
  // Enhanced features
  selectable = false,
  bulkActions = [],
  pagination,
  exportable = false,
  onExport,
  columnControls = false,
  densityControl = false,
  stickyHeader = false,
  expandable = false,
  renderExpandedRow,
  defaultDensity = 'normal',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.map(col => col.key))
  );
  const [density, setDensity] = useState<DensityMode>(defaultDensity);
  const [showColumnControls, setShowColumnControls] = useState(false);

  // Filter visible columns
  const columns = useMemo(
    () => initialColumns.filter(col => visibleColumns.has(col.key) && !col.hidden),
    [initialColumns, visibleColumns]
  );

  // Get row key
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey]?.toString() || index.toString();
  };

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleSelectRow = (rowKey: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowKey)) {
      newSelected.delete(rowKey);
    } else {
      newSelected.add(rowKey);
    }
    setSelectedRows(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map((row, idx) => getRowKey(row, idx))));
    }
  };

  // Handle row expansion
  const handleExpandRow = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  // Toggle column visibility
  const toggleColumn = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  // Handle export
  const handleExport = () => {
    const selectedData = data.filter((row, idx) => 
      selectedRows.has(getRowKey(row, idx))
    );
    const exportData = selectedRows.size > 0 ? selectedData : sortedData;
    onExport?.(exportData);
  };

  // Filter data by search
  const filteredData = searchable && searchQuery
    ? data.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      )
    : data;

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  // Get selected row data
  const selectedRowData = useMemo(
    () => data.filter((row, idx) => selectedRows.has(getRowKey(row, idx))),
    [data, selectedRows, rowKey]
  );

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="text-primary-600" />
    ) : (
      <ChevronDown size={14} className="text-primary-600" />
    );
  };

  // Get density classes
  const getDensityClasses = () => {
    switch (density) {
      case 'compact':
        return 'data-table-compact';
      case 'comfortable':
        return 'data-table-comfortable';
      default:
        return 'data-table-normal';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn('data-table-container', className)}>
      {/* Toolbar */}
      {(searchable || selectable || exportable || columnControls || densityControl) && (
        <div className="data-table-toolbar">
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            {searchable && (
              <div className="data-table-search">
                <Search size={18} className="data-table-search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="data-table-search-input"
                />
              </div>
            )}

            {/* Selection count */}
            {selectable && selectedRows.size > 0 && (
              <Badge variant="info">
                {selectedRows.size} selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk actions */}
            {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
              <div className="flex items-center gap-2">
                {bulkActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant || 'secondary'}
                    size="sm"
                    onClick={() => action.onClick(selectedRowData)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Export */}
            {exportable && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={sortedData.length === 0}
              >
                <Download size={16} />
                Export
              </Button>
            )}

            {/* Density control */}
            {densityControl && (
              <div className="flex items-center gap-1 border border-gray-300 rounded-md">
                <button
                  onClick={() => setDensity('compact')}
                  className={cn(
                    'p-1.5 hover:bg-gray-100 rounded-l-md',
                    density === 'compact' && 'bg-primary-100 text-primary-600'
                  )}
                  title="Compact"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setDensity('normal')}
                  className={cn(
                    'p-1.5 hover:bg-gray-100',
                    density === 'normal' && 'bg-primary-100 text-primary-600'
                  )}
                  title="Normal"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={() => setDensity('comfortable')}
                  className={cn(
                    'p-1.5 hover:bg-gray-100 rounded-r-md',
                    density === 'comfortable' && 'bg-primary-100 text-primary-600'
                  )}
                  title="Comfortable"
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            )}

            {/* Column controls */}
            {columnControls && (
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowColumnControls(!showColumnControls)}
                >
                  <Settings size={16} />
                  Columns
                </Button>
                {showColumnControls && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Show/Hide Columns
                      </p>
                      <div className="space-y-2">
                        {initialColumns.map((col) => (
                          <label
                            key={col.key}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns.has(col.key)}
                              onChange={() => toggleColumn(col.key)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{col.header}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {sortedData.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyMessage}
          description={searchQuery ? 'Try adjusting your search' : undefined}
        />
      ) : (
        <div className={cn('data-table-wrapper', stickyHeader && 'data-table-sticky')}>
          <table className={cn('data-table', getDensityClasses())}>
            <thead className="data-table-header">
              <tr>
                {/* Selection column */}
                {selectable && (
                  <th className="data-table-header-cell w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                )}

                {/* Expand column */}
                {expandable && (
                  <th className="data-table-header-cell w-12"></th>
                )}

                {/* Data columns */}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'data-table-header-cell',
                      column.sortable && 'cursor-pointer select-none hover:bg-gray-50',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="data-table-body">
              {sortedData.map((row, index) => {
                const key = getRowKey(row, index);
                const isSelected = selectedRows.has(key);
                const isExpanded = expandedRows.has(key);

                return (
                  <React.Fragment key={key}>
                    <tr
                      className={cn(
                        'data-table-row',
                        onRowClick && 'cursor-pointer hover:bg-gray-50',
                        isSelected && 'bg-primary-50'
                      )}
                    >
                      {/* Selection cell */}
                      {selectable && (
                        <td className="data-table-cell">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(key)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                      )}

                      {/* Expand cell */}
                      {expandable && (
                        <td className="data-table-cell">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandRow(key);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Data cells */}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'data-table-cell',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                          onClick={() => !selectable && !expandable && onRowClick?.(row)}
                        >
                          {column.render
                            ? column.render(row[column.key], row)
                            : row[column.key]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Expanded row */}
                    {expandable && isExpanded && renderExpandedRow && (
                      <tr className="data-table-expanded-row">
                        <td colSpan={columns.length + (selectable ? 1 : 0) + 1}>
                          <div className="p-4 bg-gray-50">
                            {renderExpandedRow(row)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && sortedData.length > 0 && (
        <div className="data-table-pagination">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={
                  pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.pageSize)
                }
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
