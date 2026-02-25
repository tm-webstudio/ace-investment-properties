import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailIcon } from './email-icon';

/**
 * Shared email header component.
 * Renders a centred icon, heading, and subtitle — used consistently across all templates.
 */
export default function EmailHeader({
  iconName,
  iconColor = '#10b981',
  iconSize = 32,
  title,
  subtitle,
}) {
  return (
    <Section style={headerSection}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <EmailIcon name={iconName} color={iconColor} size={iconSize} />
      </div>
      <Heading style={heading}>{title}</Heading>
      <Text style={subtitleStyle}>{subtitle}</Text>
    </Section>
  );
}

const headerSection = {
  textAlign: 'center',
  marginBottom: '24px',
};

const heading = {
  color: '#1f2937',
  fontSize: '24px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const subtitleStyle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: 0,
};
