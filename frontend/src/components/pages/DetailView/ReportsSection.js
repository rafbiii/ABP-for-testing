import React from 'react';
import { FiFlag, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import './ReportsSection.css';

function ReportsSection({ reports, userclass }) {
  // Only show for admin users
  if (userclass !== 'admin' || !reports) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="reports-section">
      <h2>
        <FiFlag />
        Reports ({reports.length})
      </h2>
      
      {reports.length === 0 ? (
        <p className="no-reports">No reports for this article.</p>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.report_id} className="report-item">
              <div className="report-header">
                <span className="report-id">ID: {report.report_id}</span>
                <div className="report-date">
                  <FiCalendar />
                  {formatDate(report.created_at)}
                </div>
              </div>
              
              <p className="report-description">{report.description}</p>
            
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportsSection;
