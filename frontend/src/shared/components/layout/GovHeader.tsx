/* ========================================
   GOVERNMENT HEADER COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { Bell, User } from 'lucide-react';

interface GovHeaderProps {
  userRole?: string;
  userName?: string;
}

export const GovHeader: React.FC<GovHeaderProps> = ({ 
  userRole = 'Manager',
  userName = 'User'
}) => {
  return (
    <header className="gov-header">
      <div className="header-logo">
        <div className="logo-circle">M</div>
        <div className="header-org">
          <div className="amharic">በኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ</div>
          <div className="english">FDRE MESOB Wellness Service</div>
        </div>
      </div>
      <div className="header-title">MESOB Wellness — National Health Management System</div>
      <div className="header-actions">
        <div className="role-badge">{userRole}</div>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={14} />
        </button>
        <button className="icon-btn" aria-label="User menu">
          <User size={14} />
        </button>
      </div>
    </header>
  );
};

GovHeader.displayName = 'GovHeader';
