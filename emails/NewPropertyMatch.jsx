import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function NewPropertyMatch({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyImage = '',
  propertyPrice = '£1,200 pcm',
  matchScore = 95,
  propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/properties/123`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
}) {
  const getMatchColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#4169E1';
    if (score >= 60) return '#f97316';
    return '#6b7280';
  };

  const getMatchLabel = (score) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Great Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  return (
    <EmailLayout preview="New property matches your criteria">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>🎯</Text>
        <Heading style={heading}>New Property Match!</Heading>
        <Text style={subtitle}>
          We found a property that matches your investment preferences.
        </Text>
      </Section>

      {/* Match Score Badge */}
      <Section style={badgeSection}>
        <span style={{
          ...matchBadge,
          backgroundColor: getMatchColor(matchScore),
        }}>
          {matchScore}% {getMatchLabel(matchScore)}
        </span>
      </Section>

      {/* Property Box - Blue Border */}
      <Section style={propertyBox}>
        {propertyImage && (
          <Img
            src={propertyImage}
            alt={propertyTitle}
            style={propertyImageStyle}
          />
        )}
        <Heading as="h2" style={propertyTitle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddress}>
          📍 {propertyAddress}
        </Text>
        <Text style={propertyPrice}>
          💰 {propertyPrice}
        </Text>
      </Section>

      {/* Match Details - Yellow Box */}
      <Section style={matchBox}>
        <Heading as="h3" style={matchHeading}>
          Why This Property Matches
        </Heading>
        <Text style={matchText}>
          This property matches your preferences based on:
        </Text>
        <Text style={matchItem}>✓ Location preferences</Text>
        <Text style={matchItem}>✓ Price range</Text>
        <Text style={matchItem}>✓ Property type</Text>
        <Text style={matchItem}>✓ Investment criteria</Text>
        <Text style={matchItem}>✓ Yield expectations</Text>
      </Section>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={propertyUrl} style={viewButton}>
          View Full Property Details
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Quick Actions - Green Box */}
      <Section style={actionsBox}>
        <Heading as="h3" style={actionsHeading}>
          Next Steps
        </Heading>
        <Text style={actionText}>
          • Review the full property listing and photos
        </Text>
        <Text style={actionText}>
          • Check the yield calculator and investment returns
        </Text>
        <Text style={actionText}>
          • Request a viewing if you're interested
        </Text>
        <Text style={actionText}>
          • Save to your favorites for later review
        </Text>
        <Text style={actionText}>
          • Contact the landlord with any questions
        </Text>
      </Section>

      {/* Tip Box */}
      <Section style={tipBox}>
        <Text style={tipText}>
          💡 <strong>Tip:</strong> Properties that match your criteria get snapped up quickly. Act fast to secure the best investment opportunities!
        </Text>
      </Section>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          View All Matches
        </Button>
      </Section>

      <Text style={footerText}>
        Want to update your preferences? Visit your dashboard to adjust your property matching criteria.
      </Text>
    </EmailLayout>
  );
}

// Styles matching ACE Investment Properties brand
const titleSection = {
  textAlign: 'center',
  marginBottom: '24px',
};

const icon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const heading = {
  color: '#1f2937',
  fontSize: '32px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: 0,
};

const badgeSection = {
  textAlign: 'center',
  marginBottom: '32px',
};

const matchBadge = {
  color: '#ffffff',
  padding: '8px 20px',
  borderRadius: '0',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const propertyBox = {
  border: '3px solid #4169E1',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: '#ffffff',
};

const propertyImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '0',
  marginBottom: '16px',
};

const propertyTitle = {
  color: '#1f2937',
  fontSize: '24px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const propertyAddress = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '4px 0',
};

const propertyPrice = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '12px 0 0 0',
};

const matchBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const matchHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const matchText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 12px 0',
  lineHeight: '22px',
};

const matchItem = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '6px 0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const viewButton = {
  backgroundColor: '#4169E1',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const actionsBox = {
  backgroundColor: '#ecfdf5',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const actionsHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const actionText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '6px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const tipBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '0',
  padding: '15px 20px',
  marginBottom: '24px',
};

const tipText = {
  color: '#78350f',
  fontSize: '14px',
  margin: 0,
  lineHeight: '22px',
};

const dashboardSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};
