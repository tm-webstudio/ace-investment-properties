import {
  Heading,
  Text,
  Section,
  Button,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function ViewingRejected({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  rejectionReason = '',
  browseLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/property-matching`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
}) {
  return (
    <EmailLayout preview="Viewing request update">
      <Heading style={heading}>Viewing Request Update</Heading>

      <Text style={text}>
        Thank you for your interest in viewing this property.
      </Text>

      {/* Property Details */}
      <Section style={propertySection}>
        <Heading style={propertyTitle}>{propertyTitle}</Heading>
        <Text style={propertyAddress}>📍 {propertyAddress}</Text>
      </Section>

      {/* Declined Message */}
      <Section style={declinedSection}>
        <Text style={declinedText}>
          Unfortunately, the landlord is unable to accommodate your viewing request at this time.
        </Text>

        {rejectionReason && (
          <Section style={reasonSection}>
            <Text style={reasonHeading}>Reason provided:</Text>
            <Text style={reasonText}>"{rejectionReason}"</Text>
          </Section>
        )}
      </Section>

      {/* Encouraging Message */}
      <Section style={encouragingSection}>
        <Text style={encouragingHeading}>Don't worry!</Text>
        <Text style={encouragingText}>
          We have many other great properties available that match your preferences.
        </Text>
      </Section>

      {/* Next Steps */}
      <Section style={nextStepsSection}>
        <Text style={nextStepsHeading}>What's Next?</Text>
        <Text style={stepText}>✓ Browse similar properties in your area</Text>
        <Text style={stepText}>✓ Save properties you're interested in</Text>
        <Text style={stepText}>✓ Request viewings for other listings</Text>
        <Text style={stepText}>✓ Set up property alerts to get notified of new matches</Text>
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Button href={browseLink} style={browseButton}>
          Browse Similar Properties
        </Button>
      </Section>

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

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
  textAlign: 'center',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px 0',
};

const propertySection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const propertyTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px 0',
};

const propertyAddress = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
};

const declinedSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  borderLeft: '4px solid #ef4444',
};

const declinedText = {
  fontSize: '16px',
  color: '#991b1b',
  margin: '0 0 15px 0',
  fontWeight: '500',
};

const reasonSection = {
  marginTop: '15px',
  paddingTop: '15px',
  borderTop: '1px solid #fecaca',
};

const reasonHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#7f1d1d',
  margin: '0 0 8px 0',
};

const reasonText = {
  fontSize: '14px',
  color: '#991b1b',
  fontStyle: 'italic',
  margin: '0',
  lineHeight: '22px',
};

const encouragingSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  textAlign: 'center',
};

const encouragingHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#047857',
  margin: '0 0 10px 0',
};

const encouragingText = {
  fontSize: '16px',
  color: '#065f46',
  margin: '0',
  lineHeight: '24px',
};

const nextStepsSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
};

const nextStepsHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 15px 0',
};

const stepText = {
  fontSize: '14px',
  color: '#333',
  margin: '8px 0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const browseButton = {
  backgroundColor: '#0066cc',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '14px 32px',
  display: 'inline-block',
};

const dashboardSection = {
  textAlign: 'center',
  margin: '20px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '12px 24px',
  display: 'inline-block',
};

const footerText = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center',
  margin: '30px 0 0 0',
  lineHeight: '22px',
};
