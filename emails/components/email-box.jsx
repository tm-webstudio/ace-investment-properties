import { Section } from '@react-email/components';
import * as React from 'react';

const variantStyles = {
  outline:       { backgroundColor: '#ffffff', border: '2px solid #e5e7eb' },
  'outline-red': { backgroundColor: '#fef2f2', border: '2px solid #fecaca' },
  green:         { backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' },
  'green-dark':  { backgroundColor: '#f8f9fa', borderLeft: '4px solid #10b981' },
  orange:        { backgroundColor: '#f8f9fa', borderLeft: '4px solid #f97316' },
  red:           { backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444' },
  'red-dark':    { backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626' },
  plain:         { backgroundColor: '#f8f9fa' },
  'plain-white': { backgroundColor: '#ffffff' },
};

export default function EmailBox({ variant = 'outline', padding = '16px', marginBottom = '16px', children }) {
  const style = {
    ...variantStyles[variant],
    borderRadius: '0',
    padding,
    marginBottom,
  };
  return <Section style={style}>{children}</Section>;
}
