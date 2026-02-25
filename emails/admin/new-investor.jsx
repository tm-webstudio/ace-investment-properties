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

export default function NewInvestor({
  investorName = 'John Smith',
  investorEmail = 'john@example.com',
  investorPhone = '+44 7700 900001',
  operatorType = 'hands-off',
  budgetMin = 1000,
  budgetMax = 2500,
  budgetType = 'monthly',
  bedroomsMin = 2,
  bedroomsMax = 4,
  propertyTypes = ['HMO', 'Apartment'],
  propertyLicences = ['HMO Licence'],
  locations = ['East London', 'North London'],
  propertiesManaging = 0,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
}) {
  const formatBudget = () => {
    if (budgetType === 'annual') {
      return `£${budgetMin.toLocaleString()} – £${budgetMax.toLocaleString()} / year`;
    }
    if (budgetType === 'purchase') {
      return `£${budgetMin.toLocaleString()} – £${budgetMax.toLocaleString()} (purchase)`;
    }
    return `£${budgetMin.toLocaleString()} – £${budgetMax.toLocaleString()} pcm`;
  };

  const formatBedrooms = () => {
    if (bedroomsMin === bedroomsMax) return `${bedroomsMin} bed`;
    return `${bedroomsMin}–${bedroomsMax} bed`;
  };

  return (
    <EmailLayout preview={`New investor registered: ${investorName}`}>
      <EmailHeader
        iconName="user"
        iconColor="#10b981"
        title="New Investor Registered"
        subtitle="A new investor has signed up and is looking for properties."
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

      {/* Investment Preferences Box */}
      <EmailBox variant="green">
        <Heading as="h3" style={preferencesHeading}>
          Investment Preferences
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={prefLabel}>Budget:</td>
              <td style={prefValue}>{formatBudget()}</td>
            </tr>
            <tr>
              <td style={prefLabel}>Bedrooms:</td>
              <td style={prefValue}>{formatBedrooms()}</td>
            </tr>
            <tr>
              <td style={prefLabel}>Property Types:</td>
              <td style={prefValue}>
                {propertyTypes && propertyTypes.length > 0
                  ? propertyTypes.join(', ')
                  : '—'}
              </td>
            </tr>
            <tr>
              <td style={prefLabel}>Licences:</td>
              <td style={prefValue}>
                {propertyLicences && propertyLicences.length > 0
                  ? propertyLicences.join(', ')
                  : '—'}
              </td>
            </tr>
            <tr>
              <td style={prefLabel}>Locations:</td>
              <td style={prefValue}>
                {locations && locations.length > 0
                  ? locations.join(', ')
                  : '—'}
              </td>
            </tr>
            <tr>
              <td style={prefLabel}>Operator Type:</td>
              <td style={{ ...prefValue, textTransform: 'capitalize' }}>
                {operatorType}
              </td>
            </tr>
            {propertiesManaging !== undefined && propertiesManaging !== null && (
              <tr>
                <td style={prefLabel}>Currently Managing:</td>
                <td style={prefValue}>{propertiesManaging} properties</td>
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
          <strong>Tip:</strong> New investors indicate active demand. Check their preferences against current listings.
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

const preferencesHeading = {
  color: '#065f46',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 10px 0',
};

const prefLabel = {
  color: '#047857',
  fontSize: '14px',
  fontWeight: '600',
  padding: '4px 0',
  width: '150px',
  verticalAlign: 'top',
};

const prefValue = {
  color: '#065f46',
  fontSize: '14px',
  padding: '4px 0',
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
