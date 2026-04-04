/**
 * Loading Skeleton Components
 * Provides visual feedback during data loading
 */

import React from 'react';
import './LoadingSkeleton.css';

// Base Skeleton Component
export const Skeleton = ({ width, height, className = '', circle = false }) => {
  const style = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: circle ? '50%' : '4px'
  };

  return <div className={`skeleton ${className}`} style={style} />;
};

// Dashboard Card Skeleton
export const DashboardCardSkeleton = () => (
  <div className="dashboard-card-skeleton">
    <div className="skeleton-header">
      <Skeleton width="40px" height="40px" circle />
      <div className="skeleton-text">
        <Skeleton width="120px" height="16px" />
        <Skeleton width="80px" height="12px" />
      </div>
    </div>
    <div className="skeleton-body">
      <Skeleton width="100%" height="60px" />
    </div>
  </div>
);

// Policy Card Skeleton
export const PolicyCardSkeleton = () => (
  <div className="policy-card-skeleton">
    <Skeleton width="100%" height="120px" />
    <div className="skeleton-details">
      <Skeleton width="60%" height="20px" />
      <Skeleton width="40%" height="16px" />
      <Skeleton width="80%" height="14px" />
    </div>
  </div>
);

// Claim List Skeleton
export const ClaimListSkeleton = ({ count = 3 }) => (
  <div className="claim-list-skeleton">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="claim-item-skeleton">
        <div className="skeleton-left">
          <Skeleton width="50px" height="50px" circle />
        </div>
        <div className="skeleton-right">
          <Skeleton width="70%" height="18px" />
          <Skeleton width="50%" height="14px" />
          <Skeleton width="30%" height="12px" />
        </div>
        <div className="skeleton-amount">
          <Skeleton width="80px" height="24px" />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="table-skeleton">
    <div className="table-header-skeleton">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} width="100%" height="16px" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="table-row-skeleton">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} width="100%" height="14px" />
        ))}
      </div>
    ))}
  </div>
);

// Worker Profile Skeleton
export const WorkerProfileSkeleton = () => (
  <div className="worker-profile-skeleton">
    <div className="profile-header-skeleton">
      <Skeleton width="80px" height="80px" circle />
      <div className="profile-info-skeleton">
        <Skeleton width="150px" height="24px" />
        <Skeleton width="120px" height="16px" />
        <Skeleton width="100px" height="14px" />
      </div>
    </div>
    <div className="profile-stats-skeleton">
      <Skeleton width="100%" height="100px" />
    </div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton = ({ height = '300px' }) => (
  <div className="chart-skeleton" style={{ height }}>
    <Skeleton width="100%" height="100%" />
  </div>
);

// Map Skeleton
export const MapSkeleton = ({ height = '400px' }) => (
  <div className="map-skeleton" style={{ height }}>
    <Skeleton width="100%" height="100%" />
    <div className="map-overlay">
      <span>Loading map...</span>
    </div>
  </div>
);

export default {
  Skeleton,
  DashboardCardSkeleton,
  PolicyCardSkeleton,
  ClaimListSkeleton,
  TableSkeleton,
  WorkerProfileSkeleton,
  ChartSkeleton,
  MapSkeleton
};
