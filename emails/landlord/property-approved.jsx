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

export default function PropertyApproved({
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
  propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/properties/123`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
}) {
  return (
    <EmailLayout preview="Property approved! Your listing is now live">
      <EmailHeader
        iconName="sparkles"
        iconColor="#10b981"
        title="Property is Now Live!"
        subtitle="Congratulations! Your property has been approved and is now visible to investors."
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

      {/* Success Box - Green */}
      <EmailBox variant="green-dark">
        <Heading as="h3" style={successHeading}>
          Your Property is Live
        </Heading>
        <Text style={successText}>
          Your property listing has been reviewed and approved by our team. It's now visible to all investors on the Ace Investment Properties platform.
        </Text>
      </EmailBox>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={propertyUrl} style={viewButton}>
          View Live Property
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Next Steps - Yellow Box */}
      <EmailBox variant="plain-white">
        <Heading as="h3" style={nextStepsHeading}>
          What Happens Next?
        </Heading>
        <Text style={stepText}>
          Qualified investors can now view your property
        </Text>
        <Text style={stepText}>
          You'll receive email notifications for viewing requests
        </Text>
        <Text style={stepText}>
          Respond quickly to viewing requests for best results
        </Text>
        <Text style={stepText}>
          Track all activity in your landlord dashboard
        </Text>
        <Text style={stepText}>
          Keep your property details and photos up to date
        </Text>
      </EmailBox>

      {/* Tips Box */}
      <EmailBox variant="orange">
        <Heading as="h3" style={tipsHeading}>
          Tips for Success
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
      </EmailBox>

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
  marginBottom: '24px',
};

const icon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
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
  margin: '20px 0',
};

const viewButton = {
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
