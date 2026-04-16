import { CheckCircle, Clock, AlertCircle, XCircle, FileText } from "lucide-react";
import "../styles/StatusTracker.css";

function StatusTracker({ status, timeline, issues = [] }) {
  // Define all possible statuses in order
  const allStatuses = [
    { key: "Applied", label: "Applied", icon: FileText },
    { key: "Under Review", label: "Under Review", icon: Clock },
    { key: "Pending Issues", label: "Pending Issues", icon: AlertCircle },
    { key: "Approved", label: "Approved", icon: CheckCircle },
    { key: "Rejected", label: "Rejected", icon: XCircle },
  ];

  // Get current status index
  const currentStatusIndex = allStatuses.findIndex((s) => s.key === status);

  // Status colors
  const getStatusColor = (statusKey, index) => {
    if (status === "Rejected" && statusKey === "Rejected") return "rejected";
    if (status === "Approved" && statusKey === "Approved") return "approved";
    if (index < currentStatusIndex) return "completed";
    if (index === currentStatusIndex) return "current";
    return "pending";
  };

  return (
    <div className="status-tracker">
      {/* Progress Steps */}
      <div className="tracker-steps">
        {allStatuses.map((step, index) => {
          const colorClass = getStatusColor(step.key, index);
          const Icon = step.icon;

          // Skip showing rejected if not rejected, and vice versa
          if (step.key === "Rejected" && status !== "Rejected") return null;
          if (status === "Rejected" && step.key === "Approved") return null;
          if (status === "Approved" && step.key === "Rejected") return null;

          return (
            <div key={step.key} className={`step ${colorClass}`}>
              <div className="step-icon-wrapper">
                <Icon className="step-icon" />
              </div>
              <span className="step-label">{step.label}</span>
              {index < allStatuses.length - 1 && status !== "Rejected" && step.key !== "Approved" && (
                <div className={`step-line ${index < currentStatusIndex ? "completed" : ""}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Display */}
      <div className={`current-status-banner ${status.toLowerCase().replace(" ", "-")}`}>
        <div className="status-content">
          <h4>Current Status: {status}</h4>
          {timeline && timeline.length > 0 && (
            <p className="last-update">
              Last updated: {timeline[timeline.length - 1].date}
            </p>
          )}
        </div>
      </div>

      {/* Issues Section */}
      {issues.length > 0 && (
        <div className="issues-section">
          <h5>Issues to Resolve:</h5>
          <ul className="issues-list">
            {issues.map((issue, index) => (
              <li key={index} className="issue-item">
                <AlertCircle className="issue-icon" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
          <p className="issue-note">
            Please resolve these issues within 7 days to avoid application rejection.
          </p>
        </div>
      )}

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <div className="timeline-section">
          <h5>Application Timeline</h5>
          <div className="timeline">
            {timeline.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <span className="timeline-date">{event.date}</span>
                  <span className="timeline-status">{event.status}</span>
                  <p className="timeline-description">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusTracker;
