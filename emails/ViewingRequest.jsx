import {
  Heading,
  Text,
  Section,
  Button,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function ViewingRequest({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  viewerName = 'Jane Doe',
  viewerEmail = 'jane@example.com',
  viewerPhone = '+44 7700 900001',
  viewerType = 'Investor',
  viewingDate = '2026-01-15',
  viewingTime = '14:00',
  message = 'I am interested in viewing this property. Please let me know if this time works for you.',
  approveLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/viewings/approve?id=123`,
  declineLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/viewings/decline?id=123`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
}) {
  return (
    <EmailLayout preview="New viewing request for your property">
      <Heading style={heading}>📬 New Viewing Request</Heading>

      <Text style={text}>
        You have received a new viewing request for your property.
      </Text>

      {/* Property Details */}
      <Section style={propertySection}>
        <Heading style={propertyTitle}>{propertyTitle}</Heading>
        <Text style={propertyAddress}>📍 {propertyAddress}</Text>
      </Section>

      {/* Requester Details */}
      <Section style={requesterSection}>
        <Text style={sectionHeading}>Requester Information</Text>

        <Row style={detailRow}>
          <Column style={detailLabel}>Name:</Column>
          <Column style={detailValue}>{viewerName}</Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailLabel}>Email:</Column>
          <Column style={detailValue}>{viewerEmail}</Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailLabel}>Phone:</Column>
          <Column style={detailValue}>{viewerPhone}</Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailLabel}>Type:</Column>
          <Column style={detailValue}>
            <span style={userTypeBadge}>{viewerType}</span>
          </Column>
        </Row>
      </Section>

      {/* Viewing Details */}
      <Section style={viewingSection}>
        <Text style={sectionHeading}>Requested Viewing Time</Text>

        <Row style={detailRow}>
          <Column style={detailLabel}>Date:</Column>
          <Column style={detailValue}>
            {new Date(viewingDate).toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailLabel}>Time:</Column>
          <Column style={detailValue}>{viewingTime}</Column>
        </Row>
      </Section>

      {/* Message */}
      {message && (
        <Section style={messageSection}>
          <Text style={sectionHeading}>Message from Requester</Text>
          <Text style={messageText}>"{message}"</Text>
        </Section>
      )}

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Text style={actionText}>
          Please respond to this viewing request:
        </Text>

        <Row>
          <Column align="center" style={{ padding: '10px 5px' }}>
            <Button href={approveLink} style={approveButton}>
              ✓ Approve Viewing
            </Button>
          </Column>
          <Column align="center" style={{ padding: '10px 5px' }}>
            <Button href={declineLink} style={declineButton}>
              ✕ Decline Request
            </Button>
          </Column>
        </Row>
      </Section>

      <Text style={noteText}>
        💡 <strong>Tip:</strong> Quick responses lead to better tenant relationships and faster bookings!
      </Text>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          Manage All Viewings
        </Button>
      </Section>
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
  margin: '0 0 20px 0',
};

const propertySection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  borderLeft: '4px solid #0066cc',
};

const propertyTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px 0',
};

const propertyAddress = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
};

const requesterSection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#fefce8',
  borderRadius: '8px',
};

const viewingSection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
};

const messageSection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  borderLeft: '4px solid #666',
};

const sectionHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 15px 0',
};

const detailRow = {
  marginBottom: '10px',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#666',
  width: '100px',
};

const detailValue = {
  fontSize: '14px',
  color: '#1a1a1a',
};

const userTypeBadge = {
  backgroundColor: '#0066cc',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const messageText = {
  fontSize: '14px',
  color: '#333',
  fontStyle: 'italic',
  lineHeight: '22px',
  margin: '0',
};

const buttonSection = {
  margin: '30px 0',
  textAlign: 'center',
};

const actionText = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 20px 0',
  textAlign: 'center',
};

const approveButton = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '14px 24px',
  display: 'inline-block',
  width: '100%',
};

const declineButton = {
  backgroundColor: '#ef4444',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '14px 24px',
  display: 'inline-block',
  width: '100%',
};

const noteText = {
  fontSize: '14px',
  color: '#666',
  lineHeight: '22px',
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fffbeb',
  borderRadius: '6px',
};

const dashboardSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const dashboardButton = {
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
