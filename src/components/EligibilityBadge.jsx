import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import "../styles/EligibilityBadge.css";

function EligibilityBadge({ status, reason }) {
  // status can be: 'eligible', 'not-eligible', 'partial'
  
  const config = {
    eligible: {
      icon: CheckCircle,
      className: "eligible",
      text: "Eligible",
    },
    "not-eligible": {
      icon: XCircle,
      className: "not-eligible",
      text: "Not Eligible",
    },
    partial: {
      icon: AlertCircle,
      className: "partial",
      text: "Check Eligibility",
    },
  };

  const { icon: Icon, className, text } = config[status] || config.partial;

  return (
    <div className={`eligibility-badge ${className}`} title={reason}>
      <Icon className="badge-icon" />
      <span className="badge-text">{text}</span>
    </div>
  );
}

export default EligibilityBadge;
