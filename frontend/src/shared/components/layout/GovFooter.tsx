/* ========================================
   GOVERNMENT FOOTER COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';

export const GovFooter: React.FC = () => {
  return (
    <footer className="gov-footer">
      <div className="footer-left">
        <strong>MESOB One-Stop Service Center</strong>
        <br />
        The FDRE MESOB Dashboard provides centralized insights
        <br />
        from each center nationwide, based on available data.
      </div>
      <div className="footer-center">
        <div className="footer-logo-circle">
          FDRE
          <br />
          MESOB
        </div>
        <div className="footer-amharic">የመሶብ አገልግሎት</div>
        <div className="footer-english">
          Federal Democratic Republic of Ethiopia · MESOB Service
        </div>
      </div>
      <div className="footer-right">
        <button className="footer-visit-btn">Visit MESOB Portal</button>
        <div className="footer-service">Citizen Service</div>
        <div className="footer-number">9838</div>
      </div>
    </footer>
  );
};

GovFooter.displayName = 'GovFooter';
