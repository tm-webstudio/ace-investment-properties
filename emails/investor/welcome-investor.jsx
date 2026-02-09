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

export default function WelcomeInvestor({
  name = 'John Doe',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
  profileLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/profile`,
  helpLink = `${process.env.NEXT_PUBLIC_SITE_URL}/help`,
}) {
  return (
    <EmailLayout preview="Welcome! Start finding your next investment property">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <EmailIcon name="sparkles" color="#10b981" size={48} />
        </div>
        <Heading style={heading}>Welcome to Ace Investment Properties!</Heading>
        <Text style={subtitle}>
          We're excited to have you join our platform, {name}.
        </Text>
      </Section>

      {/* User Type Badge */}
      <Section style={badgeSection}>
        <span style={badge}>Investor</span>
      </Section>

      {/* Investor Features - White Box with Border */}
      <Section style={featuresBox}>
        <Heading as="h3" style={featuresHeading}>
          As an Investor, you can:
        </Heading>
        <Text style={featureText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Browse thousands of investment properties
        </Text>
        <Text style={featureText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Set your investment preferences for smart matching
        </Text>
        <Text style={featureText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Request property viewings with one click
        </Text>
        <Text style={featureText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Save and compare properties
        </Text>
        <Text style={featureText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Track your investment portfolio
        </Text>
        <Text style={featureText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Get personalized property recommendations
        </Text>
      </Section>

      {/* Next Steps - Light Gray Box with Green Border */}
      <Section style={nextStepsBox}>
        <Heading as="h3" style={nextStepsHeading}>
          Get Started:
        </Heading>
        <Text style={stepText}>1. Complete your investor profile and set your preferences</Text>
        <Text style={stepText}>2. Browse properties that match your investment criteria</Text>
        <Text style={stepText}>3. Request viewings for properties you're interested in</Text>
        <Text style={stepText}>4. Start building your property portfolio</Text>
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

const heading = {
  color: '#1f2937',
  fontSize: '28px',
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
  marginBottom: '24px',
};

const badge = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '6px 16px',
  borderRadius: '0',
  fontSize: '14px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const featuresBox = {
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
};

const featuresHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const featureText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
  display: 'flex',
  alignItems: 'center',
};

const nextStepsBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #10b981',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
};

const nextStepsHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const stepText = {
  color: '#1f2937',
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
  backgroundColor: '#10b981',
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
  color: '#10b981',
  textDecoration: 'underline',
};

const footerText = {
  color: '#1f2937',
  fontSize: '14px',
  textAlign: 'center',
  fontWeight: '500',
  margin: '10px 0',
};
