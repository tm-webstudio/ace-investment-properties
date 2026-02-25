import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from '../components/email-layout';
import EmailHeader from '../components/email-header';
import EmailBox from '../components/email-box';

export default function ViewingRejected({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  rejectionReason = '',
  browseLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/property-matching`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
}) {
  return (
    <EmailLayout preview="Viewing unavailable - Browse other properties">
      <EmailHeader
        iconName="mailbox"
        iconColor="#6b7280"
        title="Viewing Request Update"
        subtitle="Thank you for your interest in viewing this property."
      />

      {/* Property Box - Blue Border */}
      <EmailBox variant="outline">
        <Heading as="h2" style={propertyTitle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddress}>
          {propertyAddress}
        </Text>
      </EmailBox>

      {/* Declined Message - Red Box */}
      <EmailBox variant="red">
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
      </EmailBox>

      {/* Encouraging Message - Green Box */}
      <EmailBox variant="green-dark">
        <Heading as="h3" style={encouragingHeading}>
          Don't worry!
        </Heading>
        <Text style={encouragingText}>
          We have many other great properties available that match your preferences.
        </Text>
      </EmailBox>

      {/* Next Steps - Light Yellow Box */}
      <EmailBox variant="plain-white">
        <Heading as="h3" style={nextStepsHeading}>
          What's Next?
        </Heading>
        <Text style={stepText}>Browse similar properties in your area</Text>
        <Text style={stepText}>Save properties you're interested in</Text>
        <Text style={stepText}>Request viewings for other listings</Text>
        <Text style={stepText}>Set up property alerts to get notified of new matches</Text>
      </EmailBox>

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
const propertyTitle = {
  color: '#1f2937',
  fontSize: '28px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const propertyAddress = {
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
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
  margin: '20px 0',
};

const browseButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
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
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '30px 0 0 0',
  lineHeight: '22px',
};
