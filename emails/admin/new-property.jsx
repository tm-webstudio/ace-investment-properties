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
import PropertyCard from '../components/property-card';
import EmailBox from '../components/email-box';

export default function NewProperty({
  submittedByName = 'Jane Doe',
  submittedByEmail = 'jane@example.com',
  submittedByPhone = '+44 7700 900002',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyType = 'Apartment',
  propertyPrice = '1,200',
  bedrooms = 2,
  bathrooms = 1,
  availability = 'vacant',
  propertyLicence = 'hmo',
  condition = 'excellent',
  propertyImage = '',
}) {
  return (
    <EmailLayout preview={`New property submitted: ${propertyAddress}`}>
      <EmailHeader
        iconName="home"
        iconColor="#1a1a2e"
        title="New Property Submitted"
        subtitle="A new property has been submitted and is awaiting review."
      />

      {/* Submitter Info Box */}
      <EmailBox variant="outline">
        <Heading as="h3" style={infoHeading}>
          Landlord Info
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Name:</td>
              <td style={infoValue}>{submittedByName}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{submittedByEmail}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Phone:</td>
              <td style={infoValue}>{submittedByPhone}</td>
            </tr>
          </tbody>
        </table>
      </EmailBox>

      {/* Property Card */}
      <PropertyCard
        propertyAddress={propertyAddress}
        propertyType={propertyType}
        propertyPrice={propertyPrice}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        availability={availability}
        propertyLicence={propertyLicence}
        condition={condition}
        propertyImage={propertyImage}
      />

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button
          href={`tel:${submittedByPhone.replace(/\s/g, '')}`}
          style={callButton}
        >
          Call Landlord
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Tip Box */}
      <EmailBox variant="orange">
        <Text style={tipText}>
          <strong>Tip:</strong> Review the property details and approve or request changes via the admin panel.
        </Text>
      </EmailBox>
    </EmailLayout>
  );
}

// Styles
const infoHeading = {
  color: '#1f2937',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 10px 0',
};

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  padding: '4px 0',
  width: '100px',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '4px 0',
};

const buttonSection = {
  textAlign: 'center',
  margin: '20px 0',
};

const callButton = {
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

const tipText = {
  color: '#374151',
  fontSize: '14px',
  margin: 0,
  lineHeight: '22px',
};
