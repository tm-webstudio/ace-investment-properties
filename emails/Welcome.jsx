import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function Welcome({
  name = 'John Doe',
  userType = 'Investor', // 'Investor' or 'Landlord'
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  profileLink = `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
  helpLink = `${process.env.NEXT_PUBLIC_SITE_URL}/help`,
}) {
  const isInvestor = userType === 'Investor';

  return (
    <EmailLayout preview="Welcome to Ace Investment Properties">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>🎉</Text>
        <Heading style={heading}>Welcome to Ace Investment Properties!</Heading>
        <Text style={subtitle}>
          We're excited to have you join our platform, {name}.
        </Text>
      </Section>

      {/* User Type Badge */}
      <Section style={badgeSection}>
        <span style={badge}>{userType}</span>
      </Section>

      {/* User Type Specific Content - Light Yellow Box */}
      <Section style={featuresBox}>
        <Heading as="h3" style={featuresHeading}>
          {isInvestor ? 'As an Investor, you can:' : 'As a Landlord, you can:'}
        </Heading>
        {isInvestor ? (
          <>
            <Text style={featureText}>✓ Browse thousands of investment properties</Text>
            <Text style={featureText}>✓ Set your investment preferences for smart matching</Text>
            <Text style={featureText}>✓ Request property viewings with one click</Text>
            <Text style={featureText}>✓ Save and compare properties</Text>
            <Text style={featureText}>✓ Track your investment portfolio</Text>
            <Text style={featureText}>✓ Get personalized property recommendations</Text>
          </>
        ) : (
          <>
            <Text style={featureText}>✓ List your properties and reach qualified investors</Text>
            <Text style={featureText}>✓ Manage viewing requests in one dashboard</Text>
            <Text style={featureText}>✓ Track your property portfolio performance</Text>
            <Text style={featureText}>✓ Communicate directly with potential tenants</Text>
            <Text style={featureText}>✓ Keep all documents organized and up-to-date</Text>
            <Text style={featureText}>✓ Receive alerts for expiring documents</Text>
          </>
        )}
      </Section>

      {/* Next Steps - Green Box */}
      <Section style={nextStepsBox}>
        <Heading as="h3" style={nextStepsHeading}>
          Get Started:
        </Heading>
        {isInvestor ? (
          <>
            <Text style={stepText}>1. Complete your investor profile and set your preferences</Text>
            <Text style={stepText}>2. Browse properties that match your investment criteria</Text>
            <Text style={stepText}>3. Request viewings for properties you're interested in</Text>
            <Text style={stepText}>4. Start building your property portfolio</Text>
          </>
        ) : (
          <>
            <Text style={stepText}>1. Complete your landlord profile</Text>
            <Text style={stepText}>2. List your first property with photos and details</Text>
            <Text style={stepText}>3. Upload required documents (certificates, insurance, etc.)</Text>
            <Text style={stepText}>4. Start receiving viewing requests from qualified investors</Text>
          </>
        )}
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Button href={dashboardLink} style={primaryButton}>
          Go to My Dashboard
        </Button>
        <Button href={profileLink} style={secondaryButton}>
          Complete My Profile
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={helpText}>
        Need help getting started? Visit our{' '}
        <a href={helpLink} style={link}>Help Center</a>{' '}
        or reply to this email with any questions.
      </Text>

      <Text style={footerText}>
        We're here to help you succeed!
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

const badge = {
  backgroundColor: '#4169E1',
  color: '#ffffff',
  padding: '6px 16px',
  borderRadius: '0',
  fontSize: '14px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const featuresBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const featuresHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const featureText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
  paddingLeft: '10px',
};

const nextStepsBox = {
  backgroundColor: '#ecfdf5',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const nextStepsHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const stepText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#4169E1',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const secondaryButton = {
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};

const link = {
  color: '#4169E1',
  textDecoration: 'underline',
};

const footerText = {
  color: '#1f2937',
  fontSize: '14px',
  textAlign: 'center',
  fontWeight: '500',
  margin: '10px 0',
};
