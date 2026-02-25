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
import PropertyCard from '../components/property-card';

export default function PropertyRejected({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyType = 'apartment',
  bedrooms = 2,
  bathrooms = 1,
  propertyPrice = '0',
  availability = 'vacant',
  propertyLicence = 'none',
  condition = 'good',
  propertyImage = '',
  rejectionReason = 'The property listing is missing required information. Please add detailed property descriptions, high-quality photos, and all required certificates.',
  editLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/properties/123/edit`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
}) {
  return (
    <EmailLayout preview="Property listing update - Action required">
      <EmailHeader
        iconName="pencil"
        iconColor="#f97316"
        title="Property Needs Updates"
        subtitle="Your property submission requires some updates before it can go live."
      />

      {/* Property Card */}
      <PropertyCard
        propertyAddress={propertyTitle}
        propertyType={propertyType}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        propertyPrice={propertyPrice}
        availability={availability}
        propertyLicence={propertyLicence}
        condition={condition}
        propertyImage={propertyImage}
      />

      {/* Rejection Reason - Orange Box */}
      <EmailBox variant="orange">
        <Heading as="h3" style={warningHeading}>
          Updates Required
        </Heading>
        <Text style={warningText}>
          {rejectionReason}
        </Text>
      </EmailBox>

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
      <EmailBox variant="plain-white">
        <Heading as="h3" style={guidelinesHeading}>
          Property Listing Guidelines
        </Heading>
        <Text style={guidelineText}>
          High-quality photos (minimum 5 images)
        </Text>
        <Text style={guidelineText}>
          Detailed property description (minimum 100 words)
        </Text>
        <Text style={guidelineText}>
          Accurate property specifications
        </Text>
        <Text style={guidelineText}>
          Current Gas Safety Certificate
        </Text>
        <Text style={guidelineText}>
          EPC Certificate (Energy Performance)
        </Text>
        <Text style={guidelineText}>
          Valid landlord insurance documents
        </Text>
        <Text style={guidelineText}>
          Competitive rental pricing
        </Text>
      </EmailBox>

      {/* Help Box - Green */}
      <EmailBox variant="green-dark">
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
      </EmailBox>

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
  margin: '20px 0',
};

const instructionText = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 20px 0',
  textAlign: 'center',
};

const editButton = {
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
  margin: '20px 0',
  lineHeight: '22px',
};
