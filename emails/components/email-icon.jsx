/**
 * Email Icon Component
 * Provides emoji icons for email templates (universally supported in all email clients)
 * Replaces SVG icons which are not supported in many email clients
 */

export const EmailIcon = ({ name, color = '#10b981', size = 32 }) => {
  const baseStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    fontSize: `${size}px`,
    lineHeight: 1,
  };

  const icons = {
    check: (
      <span style={baseStyle}>✓</span>
    ),
    checkCircle: (
      <span style={baseStyle}>✅</span>
    ),
    sparkles: (
      <span style={baseStyle}>✨</span>
    ),
    mapPin: (
      <span style={baseStyle}>📍</span>
    ),
    home: (
      <span style={baseStyle}>🏠</span>
    ),
    calendar: (
      <span style={baseStyle}>📅</span>
    ),
    clock: (
      <span style={baseStyle}>🕐</span>
    ),
    lock: (
      <span style={baseStyle}>🔒</span>
    ),
    shield: (
      <span style={baseStyle}>🛡️</span>
    ),
    key: (
      <span style={baseStyle}>🔑</span>
    ),
    target: (
      <span style={baseStyle}>🎯</span>
    ),
    banknote: (
      <span style={baseStyle}>💷</span>
    ),
    dollarSign: (
      <span style={baseStyle}>💰</span>
    ),
    xCircle: (
      <span style={baseStyle}>❌</span>
    ),
    alertCircle: (
      <span style={baseStyle}>ℹ️</span>
    ),
    alertTriangle: (
      <span style={baseStyle}>⚠️</span>
    ),
    mail: (
      <span style={baseStyle}>📧</span>
    ),
    fileText: (
      <span style={baseStyle}>📄</span>
    ),
  };

  return icons[name] || null;
};
