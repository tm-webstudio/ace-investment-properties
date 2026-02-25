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
import PropertyCard from '../components/property-card';

export default function ViewingRequest({
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
  viewerName = 'Jane Doe',
  viewerEmail = 'jane@example.com',
  viewerPhone = '+44 7700 900001',
  viewerType = 'Investor',
  viewingDate = '2026-01-15',
  viewingTime = '14:00',
  message = 'I am interested in viewing this property. Please let me know if this time works for you.',
  approveLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/viewings/approve?id=123`,
  declineLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/viewings/decline?id=123`,
}) {
  return (
    <EmailLayout preview="New viewing request - Respond now">
      <EmailHeader
        iconName="home"
        iconColor="#10b981"
        title="New Viewing Request"
        subtitle="You have received a new viewing request for your property."
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

      {/* Requester Info - White Box with Border */}
      <EmailBox variant="outline">
        <Heading as="h3" style={infoHeading}>
          Requester Information
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Name:</td>
              <td style={infoValue}>{viewerName}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{viewerEmail}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Phone:</td>
              <td style={infoValue}>{viewerPhone}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Type:</td>
              <td>
                <span style={badge}>{viewerType}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </EmailBox>

      {/* Viewing Details */}
      <Section style={detailsSection}>
        <Text style={detailsText}>
          <EmailIcon name="calendar" color="#10b981" size={18} />
          <strong>Requested Date:</strong>{' '}
          {new Date(viewingDate).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={detailsText}>
          <EmailIcon name="clock" color="#10b981" size={18} />
          <strong>Requested Time:</strong> {viewingTime}
        </Text>
        {message && (
          <>
            <Text style={detailsText}>
              <strong>Message:</strong>
            </Text>
            <Text style={messageText}>"{message}"</Text>
          </>
        )}
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Button href={approveLink} style={approveButton}>
          Approve Viewing
        </Button>
        <Button href={declineLink} style={declineButton}>
          Decline Request
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={tipText}>
        <strong>Tip:</strong> Quick responses lead to better tenant relationships and faster bookings!
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

const badge = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '4px 12px',
  borderRadius: '0',
  fontSize: '12px',
  fontWeight: '600',
};

const detailsSection = {
  marginBottom: '24px',
};

const detailsText = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '8px 0',
  display: 'flex',
  alignItems: 'center',
};

const messageText = {
  color: '#6b7280',
  fontSize: '14px',
  fontStyle: 'italic',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #10b981',
  margin: '12px 0',
  borderRadius: '0',
};

const buttonSection = {
  textAlign: 'center',
  margin: '20px 0',
};

const approveButton = {
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

const declineButton = {
  backgroundColor: '#ef4444',
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

const tipText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '20px 0',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #f97316',
  borderRadius: '0',
};
