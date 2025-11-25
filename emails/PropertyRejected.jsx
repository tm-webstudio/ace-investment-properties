import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function PropertyRejected({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  rejectionReason = 'The property listing is missing required information. Please add detailed property descriptions, high-quality photos, and all required certificates.',
  editLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/properties/123/edit`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
}) {
  return (
    <EmailLayout preview="Property needs updates">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>📝</Text>
        <Heading style={heading}>Property Needs Updates</Heading>
        <Text style={subtitle}>
          Your property submission requires some updates before it can go live.
        </Text>
      </Section>

      {/* Property Box - Blue Border */}
      <Section style={propertyBox}>
        <Heading as="h2" style={propertyTitle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddress}>
          📍 {propertyAddress}
        </Text>
      </Section>

      {/* Rejection Reason - Orange Box */}
      <Section style={warningBox}>
        <Heading as="h3" style={warningHeading}>
          Updates Required
        </Heading>
        <Text style={warningText}>
          {rejectionReason}
        </Text>
      </Section>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Text style={instructionText}>
          Make the required updates to get your property approved:
        </Text>
        <Button href={editLink} style={editButton}>
          Edit Property Listing
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Guidelines - Yellow Box */}
      <Section style={guidelinesBox}>
        <Heading as="h3" style={guidelinesHeading}>
          Property Listing Guidelines
        </Heading>
        <Text style={guidelineText}>
          ✓ High-quality photos (minimum 5 images)
        </Text>
        <Text style={guidelineText}>
          ✓ Detailed property description (minimum 100 words)
        </Text>
        <Text style={guidelineText}>
          ✓ Accurate property specifications
        </Text>
        <Text style={guidelineText}>
          ✓ Current Gas Safety Certificate
        </Text>
        <Text style={guidelineText}>
          ✓ EPC Certificate (Energy Performance)
        </Text>
        <Text style={guidelineText}>
          ✓ Valid landlord insurance documents
        </Text>
        <Text style={guidelineText}>
          ✓ Competitive rental pricing
        </Text>
      </Section>

      {/* Help Box - Green */}
      <Section style={helpBox}>
        <Heading as="h3" style={helpHeading}>
          Need Help?
        </Heading>
        <Text style={helpText}>
          Our team is here to help you get your property approved quickly. If you have questions about the required updates, please contact us:
        </Text>
        <Text style={helpText}>
          📧 Email: support@aceinvestmentproperties.co.uk
        </Text>
        <Text style={helpText}>
          📞 Phone: +44 20 1234 5678
        </Text>
      </Section>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={footerText}>
        Once you've made the required updates, our team will review your property again within 24 hours.
      </Text>
    </EmailLayout>
  );
}

// Styles matching ACE Investment Properties brand
const titleSection = {
  textAlign: 'center',
  marginBottom: '32px',
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

const propertyBox = {
  border: '3px solid #4169E1',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: '#ffffff',
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
  margin: 0,
};

const warningBox = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #f97316',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const warningHeading = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const warningText = {
  color: '#78350f',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const instructionText = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 20px 0',
  textAlign: 'center',
};

const editButton = {
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

const guidelinesBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const guidelinesHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const guidelineText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
};

const helpBox = {
  backgroundColor: '#ecfdf5',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const helpHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const helpText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '6px 0',
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
