import './Badge.css';

export const STATUS_CONFIGS = {
  // Incident statuses
  ACTIVE: { label: 'Active', variant: 'danger', pulse: true },
  EN_ROUTE: { label: 'En Route', variant: 'cyan', pulse: false },
  REACHED: { label: 'Reached', variant: 'warning', pulse: false },
  RESOLVED: { label: 'Resolved', variant: 'success', pulse: false },
  ESCALATED: { label: 'Escalated', variant: 'purple', pulse: true },
  CLOSED: { label: 'Closed', variant: 'muted', pulse: false },
  // Officer statuses
  ON_PATROL: { label: 'On Patrol', variant: 'success', pulse: false },
  ACTIVE_CALL: { label: 'Active Call', variant: 'cyan', pulse: true },
  RETURNING: { label: 'Returning', variant: 'warning', pulse: false },
  OFF_DUTY: { label: 'Off Duty', variant: 'muted', pulse: false },
  // Citizen statuses
  VERIFIED: { label: 'Verified', variant: 'success', pulse: false },
  UNVERIFIED: { label: 'Unverified', variant: 'warning', pulse: false },
  SUSPENDED: { label: 'Suspended', variant: 'danger', pulse: false },
  HIDDEN: { label: 'Hidden', variant: 'muted', pulse: false },
  // Severity
  CRITICAL: { label: 'Critical', variant: 'danger', pulse: true },
  HIGH: { label: 'High', variant: 'orange', pulse: false },
  MEDIUM: { label: 'Medium', variant: 'warning', pulse: false },
  LOW: { label: 'Low', variant: 'success', pulse: false },
};

export default function Badge({ status, label, variant, pulse, size = 'sm', dot = true }) {
  const config = status ? STATUS_CONFIGS[status] : null;
  const resolvedVariant = config?.variant || variant || 'muted';
  const resolvedLabel = config?.label || label || status || '';
  const shouldPulse = config?.pulse || pulse;

  return (
    <span className={`badge badge-${resolvedVariant} badge-${size} ${shouldPulse ? 'badge-pulse' : ''}`}>
      {dot && <span className="badge-dot" />}
      {resolvedLabel}
    </span>
  );
}
