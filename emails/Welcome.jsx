import {
  Heading,
  Text,
  Section,
  Button,
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
      <Heading style={heading}>Welcome to Ace Properties! 🎉</Heading>

      <Text style={text}>
        Hi {name},
      </Text>

      <Text style={text}>
        Welcome to Ace Investment Properties! We're excited to have you join our platform.
      </Text>

      {/* User Type Specific Content */}
      <Section style={userTypeSection}>
        {isInvestor ? (
          <>
            <Heading style={sectionHeading}>As an Investor, you can:</Heading>
            <Text style={featureText}>✓ Browse thousands of investment properties</Text>
            <Text style={featureText}>✓ Set your investment preferences for smart matching</Text>
            <Text style={featureText}>✓ Request property viewings with one click</Text>
            <Text style={featureText}>✓ Save and compare properties</Text>
            <Text style={featureText}>✓ Track your investment portfolio</Text>
            <Text style={featureText}>✓ Get personalized property recommendations</Text>
          </>
        ) : (
          <>
            <Heading style={sectionHeading}>As a Landlord, you can:</Heading>
            <Text style={featureText}>✓ List your properties and reach qualified investors</Text>
            <Text style={featureText}>✓ Manage viewing requests in one dashboard</Text>
            <Text style={featureText}>✓ Track your property portfolio performance</Text>
            <Text style={featureText}>✓ Communicate directly with potential tenants</Text>
            <Text style={featureText}>✓ Keep all documents organized and up-to-date</Text>
            <Text style={featureText}>✓ Receive alerts for expiring documents</Text>
          </>
        )}
      </Section>

      {/* Next Steps */}
      <Section style={nextStepsSection}>
        <Text style={nextStepsHeading}>Get Started:</Text>
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

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={dashboardLink} style={primaryButton}>
          Go to My Dashboard
        </Button>
      </Section>

      <Section style={secondaryButtonSection}>
        <Button href={profileLink} style={secondaryButton}>
          Complete My Profile
        </Button>
      </Section>

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
  margin: '0 0 15px 0',
};

const userTypeSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  borderLeft: '4px solid #0066cc',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 15px 0',
};

const featureText = {
  fontSize: '14px',
  color: '#333',
  margin: '8px 0',
  lineHeight: '22px',
  paddingLeft: '10px',
};

const nextStepsSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
};

const nextStepsHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#047857',
  margin: '0 0 15px 0',
};

const stepText = {
  fontSize: '14px',
  color: '#065f46',
  margin: '8px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '30px 0 15px 0',
};

const primaryButton = {
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

const secondaryButtonSection = {
  textAlign: 'center',
  margin: '15px 0 30px 0',
};

const secondaryButton = {
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

const helpText = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
};

const footerText = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center',
  fontWeight: '500',
  margin: '10px 0',
};
