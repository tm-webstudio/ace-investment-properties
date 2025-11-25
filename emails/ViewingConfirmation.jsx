import {
  Heading,
  Text,
  Img,
  Section,
  Button,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function ViewingConfirmation({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyImage = 'https://via.placeholder.com/600x300',
  viewingDate = '2026-01-15',
  viewingTime = '14:00',
  landlordName = 'John Smith',
  landlordPhone = '+44 7700 900000',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
}) {
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Property+Viewing:+${encodeURIComponent(propertyTitle)}&dates=${viewingDate.replace(/-/g, '')}T${viewingTime.replace(':', '')}00/${viewingDate.replace(/-/g, '')}T${viewingTime.replace(':', '')}00&details=${encodeURIComponent(propertyAddress)}&location=${encodeURIComponent(propertyAddress)}`;
  const directionsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyAddress)}`;

  return (
    <EmailLayout preview="Your viewing has been confirmed!">
      <Heading style={heading}>✓ Viewing Confirmed!</Heading>

      <Text style={text}>
        Great news! Your viewing request has been approved by the landlord.
      </Text>

      {/* Property Image */}
      <Section style={imageSection}>
        <Img
          src={propertyImage}
          alt={propertyTitle}
          width="560"
          style={propertyImg}
        />
      </Section>

      {/* Property Details */}
      <Section style={propertySection}>
        <Heading style={propertyTitle}>{propertyTitle}</Heading>
        <Text style={propertyAddress}>{propertyAddress}</Text>
      </Section>

      {/* Viewing Details */}
      <Section style={detailsSection}>
        <Text style={detailsHeading}>Viewing Details</Text>

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

        <Row style={detailRow}>
          <Column style={detailLabel}>Landlord:</Column>
          <Column style={detailValue}>{landlordName}</Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailLabel}>Contact:</Column>
          <Column style={detailValue}>{landlordPhone}</Column>
        </Row>
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Row>
          <Column align="center" style={{ padding: '10px 5px' }}>
            <Button href={calendarLink} style={calendarButton}>
              📅 Add to Calendar
            </Button>
          </Column>
          <Column align="center" style={{ padding: '10px 5px' }}>
            <Button href={directionsLink} style={directionsButton}>
              🗺️ Get Directions
            </Button>
          </Column>
        </Row>
      </Section>

      <Section style={tipsSection}>
        <Text style={tipsHeading}>Viewing Tips:</Text>
        <Text style={tipText}>• Arrive 5 minutes early</Text>
        <Text style={tipText}>• Bring a list of questions</Text>
        <Text style={tipText}>• Take photos/notes if permitted</Text>
        <Text style={tipText}>• Check all rooms and amenities</Text>
      </Section>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          View My Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
}

const heading = {
  color: '#10b981',
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

const imageSection = {
  margin: '20px 0',
};

const propertyImg = {
  width: '100%',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
};

const propertySection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
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

const detailsSection = {
  margin: '30px 0',
  padding: '20px',
  border: '2px solid #10b981',
  borderRadius: '8px',
};

const detailsHeading = {
  fontSize: '18px',
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
  width: '120px',
};

const detailValue = {
  fontSize: '14px',
  color: '#1a1a1a',
};

const buttonSection = {
  margin: '30px 0',
};

const calendarButton = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '12px 20px',
  display: 'inline-block',
  width: '100%',
};

const directionsButton = {
  backgroundColor: '#0066cc',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '12px 20px',
  display: 'inline-block',
  width: '100%',
};

const tipsSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
};

const tipsHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 10px 0',
};

const tipText = {
  fontSize: '14px',
  color: '#666',
  margin: '5px 0',
  lineHeight: '20px',
};

const dashboardSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '14px 32px',
  display: 'inline-block',
};
