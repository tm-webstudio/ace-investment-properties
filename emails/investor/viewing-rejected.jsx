import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from '../components/email-layout';
import { EmailIcon } from '../components/email-icon';

export default function ViewingRejected({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  rejectionReason = '',
  browseLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/property-matching`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
}) {
  return (
    <EmailLayout preview="Viewing unavailable - Browse other properties">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>📬</Text>
        <Heading style={heading}>Viewing Request Update</Heading>
        <Text style={subtitle}>
          Thank you for your interest in viewing this property.
        </Text>
      </Section>

      {/* Property Box - Blue Border */}
      <Section style={propertyBox}>
        <Heading as="h2" style={propertyTitle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddress}>
          {propertyAddress}
        </Text>
      </Section>

      {/* Declined Message - Red Box */}
      <Section style={declinedBox}>
        <Heading as="h3" style={declinedHeading}>
          Request Declined
        </Heading>
        <Text style={declinedText}>
          Unfortunately, the landlord is unable to accommodate your viewing request at this time.
        </Text>

        {rejectionReason && (
          <>
            <Hr style={hrLight} />
            <Text style={reasonHeading}>Reason provided:</Text>
            <Text style={reasonText}>"{rejectionReason}"</Text>
          </>
        )}
      </Section>

      {/* Encouraging Message - Green Box */}
      <Section style={encouragingBox}>
        <Heading as="h3" style={encouragingHeading}>
          Don't worry!
        </Heading>
        <Text style={encouragingText}>
          We have many other great properties available that match your preferences.
        </Text>
      </Section>

      {/* Next Steps - Light Yellow Box */}
      <Section style={nextStepsBox}>
        <Heading as="h3" style={nextStepsHeading}>
          What's Next?
        </Heading>
        <Text style={stepText}>Browse similar properties in your area</Text>
        <Text style={stepText}>Save properties you're interested in</Text>
        <Text style={stepText}>Request viewings for other listings</Text>
        <Text style={stepText}>Set up property alerts to get notified of new matches</Text>
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Button href={browseLink} style={browseButton}>
          Browse Similar Properties
        </Button>
      </Section>

      <Hr style={hr} />

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={footerText}>
        Need help finding the right property? Our team is here to assist you.
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
  border: '2px solid #e5e7eb',
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

const declinedBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const declinedHeading = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const declinedText = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
};

const hrLight = {
  borderColor: '#fecaca',
  margin: '16px 0',
};

const reasonHeading = {
  color: '#7f1d1d',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const reasonText = {
  color: '#991b1b',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
  lineHeight: '22px',
};

const encouragingBox = {
  backgroundColor: '#f8f9fa', borderLeft: '4px solid #10b981',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center',
};

const encouragingHeading = {
  color: '#047857',
  fontSize: '20px',
  fontWeight: '500',
  margin: '0 0 10px 0',
};

const encouragingText = {
  color: '#065f46',
  fontSize: '16px',
  margin: '0',
  lineHeight: '24px',
};

const nextStepsBox = {
  backgroundColor: '#ffffff',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const nextStepsHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const stepText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const browseButton = {
  backgroundColor: '#10b981',
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

const dashboardSection = {
  textAlign: 'center',
  margin: '20px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '30px 0 0 0',
  lineHeight: '22px',
};
