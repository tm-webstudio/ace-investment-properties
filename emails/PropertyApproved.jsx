import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function PropertyApproved({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/properties/123`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
}) {
  return (
    <EmailLayout preview="Your property is now live!">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>🎉</Text>
        <Heading style={heading}>Property is Now Live!</Heading>
        <Text style={subtitle}>
          Congratulations! Your property has been approved and is now visible to investors.
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

      {/* Success Box - Green */}
      <Section style={successBox}>
        <Heading as="h3" style={successHeading}>
          ✓ Your Property is Live
        </Heading>
        <Text style={successText}>
          Your property listing has been reviewed and approved by our team. It's now visible to all investors on the Ace Investment Properties platform.
        </Text>
      </Section>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={propertyUrl} style={viewButton}>
          View Live Property
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Next Steps - Yellow Box */}
      <Section style={nextStepsBox}>
        <Heading as="h3" style={nextStepsHeading}>
          What Happens Next?
        </Heading>
        <Text style={stepText}>
          ✓ Qualified investors can now view your property
        </Text>
        <Text style={stepText}>
          ✓ You'll receive email notifications for viewing requests
        </Text>
        <Text style={stepText}>
          ✓ Respond quickly to viewing requests for best results
        </Text>
        <Text style={stepText}>
          ✓ Track all activity in your landlord dashboard
        </Text>
        <Text style={stepText}>
          ✓ Keep your property details and photos up to date
        </Text>
      </Section>

      {/* Tips Box */}
      <Section style={tipsBox}>
        <Heading as="h3" style={tipsHeading}>
          💡 Tips for Success
        </Heading>
        <Text style={tipText}>
          • Respond to viewing requests within 24 hours
        </Text>
        <Text style={tipText}>
          • Keep your availability calendar updated
        </Text>
        <Text style={tipText}>
          • Ensure all documents are current
        </Text>
        <Text style={tipText}>
          • Add high-quality photos to attract more interest
        </Text>
        <Text style={tipText}>
          • Provide detailed, accurate property information
        </Text>
      </Section>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={footerText}>
        Questions? Our team is here to help you succeed. Contact support@aceinvestmentproperties.co.uk
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

const successBox = {
  backgroundColor: '#ecfdf5',
  borderLeft: '4px solid #10b981',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const successHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const successText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const viewButton = {
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

const nextStepsBox = {
  backgroundColor: '#fef3c7',
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

const tipsBox = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #f97316',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const tipsHeading = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const tipText = {
  color: '#78350f',
  fontSize: '14px',
  margin: '6px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
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
