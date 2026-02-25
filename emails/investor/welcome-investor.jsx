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
import { EmailIcon } from '../components/email-icon';
import EmailBox from '../components/email-box';

export default function WelcomeInvestor({
  name = 'John Doe',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
  profileLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/profile`,
  helpLink = `${process.env.NEXT_PUBLIC_SITE_URL}/help`,
}) {
  return (
    <EmailLayout preview="Welcome! Start finding your next investment property">
      <EmailHeader
        iconName="sparkles"
        iconColor="#10b981"
        title="Welcome to Ace Investment Properties!"
        subtitle={`We're excited to have you join our platform, ${name}.`}
      />

      {/* User Type Badge */}
      <Section style={badgeSection}>
        <span style={badge}>Investor</span>
      </Section>

      {/* Investor Features - White Box with Border */}
      <EmailBox variant="outline">
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
      </EmailBox>

      {/* Next Steps - Light Gray Box with Green Border */}
      <EmailBox variant="green-dark">
        <Heading as="h3" style={nextStepsHeading}>
          Get Started:
        </Heading>
        <Text style={stepText}>1. Complete your investor profile and set your preferences</Text>
        <Text style={stepText}>2. Browse properties that match your investment criteria</Text>
        <Text style={stepText}>3. Request viewings for properties you're interested in</Text>
        <Text style={stepText}>4. Start building your property portfolio</Text>
      </EmailBox>

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
  fontWeight: '600',
  display: 'inline-block',
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
  margin: '20px 0',
};

const primaryButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const secondaryButton = {
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
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
