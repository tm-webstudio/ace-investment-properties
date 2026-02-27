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

export default function NewViewing({
  investorName = 'Jane Doe',
  investorEmail = 'jane@example.com',
  investorPhone = '+44 7700 900001',
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyType = 'apartment',
  bedrooms = 2,
  bathrooms = 1,
  propertyPrice = '1,200',
  availability = 'vacant',
  propertyLicence = 'none',
  condition = 'good',
  propertyImage = '',
  viewingDate = '2026-01-15',
  viewingTime = '14:00',
  message = '',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
}) {
  return (
    <EmailLayout preview={`New viewing request: ${propertyTitle} by ${investorName}`}>
      <EmailHeader
        iconName="calendar"
        iconColor="#10b981"
        title="New Viewing Request"
        subtitle="An investor has requested a viewing for one of your listed properties."
      />

      {/* Investor Info Box */}
      <EmailBox variant="outline">
        <Heading as="h3" style={infoHeading}>
          Investor Information
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Name:</td>
              <td style={infoValue}>{investorName}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{investorEmail}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Phone:</td>
              <td style={infoValue}>{investorPhone}</td>
            </tr>
          </tbody>
        </table>
      </EmailBox>

      {/* Property Card */}
      <PropertyCard
        propertyAddress={propertyTitle}
        propertyType={propertyType}
        propertyPrice={propertyPrice}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        availability={availability}
        propertyLicence={propertyLicence}
        condition={condition}
        propertyImage={propertyImage}
      />

      {/* Viewing Details Box */}
      <EmailBox variant="outline">
        <Heading as="h3" style={infoHeading}>
          Viewing Details
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Date:</td>
              <td style={infoValue}>
                {new Date(viewingDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </td>
            </tr>
            <tr>
              <td style={infoLabel}>Time:</td>
              <td style={infoValue}>{viewingTime}</td>
            </tr>
            {message && (
              <tr>
                <td style={infoLabel}>Message:</td>
                <td style={infoValue}>
                  <Text style={messageText}>"{message}"</Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </EmailBox>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button href={dashboardLink} style={viewButton}>
          View in Admin Panel
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Tip Box */}
      <EmailBox variant="green">
        <Text style={tipText}>
          <strong>Tip:</strong> Approve or decline this viewing request from the admin panel to keep the investor updated.
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
  verticalAlign: 'top',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '4px 0',
};

const messageText = {
  color: '#6b7280',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '4px 0 0 0',
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

const tipText = {
  color: '#065f46',
  fontSize: '14px',
  margin: 0,
  lineHeight: '22px',
};
