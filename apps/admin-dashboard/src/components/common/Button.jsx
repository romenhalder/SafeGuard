import './Button.css';

export default function Button({
  children, variant = 'primary', size = 'md', icon: Icon, iconRight,
  loading, disabled, onClick, type = 'button', id, fullWidth, className = '',
}) {
  return (
    <button
      type={type}
      id={id}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
    >
      {loading ? (
        <span className="btn-spinner animate-spin" />
      ) : Icon && !iconRight ? (
        <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />
      ) : null}
      {children}
      {!loading && Icon && iconRight && (
        <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />
      )}
    </button>
  );
}
