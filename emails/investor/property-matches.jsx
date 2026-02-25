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

const defaultProperties = [
  {
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    propertyAddress: '123 Nash Road, London, E1 1AA',
    propertyImage: '',
    propertyPrice: '1,200',
    availability: 'vacant',
    propertyLicence: 'hmo',
    condition: 'excellent',
    matchScore: 95,
    propertyUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/properties/123`,
  },
  {
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    propertyAddress: 'Oak Street, Manchester, M1 2AB',
    propertyImage: '',
    propertyPrice: '1,500',
    availability: 'tenanted',
    propertyLicence: 'none',
    condition: 'good',
    matchScore: 82,
    propertyUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/properties/456`,
  },
];

export default function PropertyMatches({
  investorName = 'Investor',
  context = 'welcome',
  properties = defaultProperties,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
  totalMatches = 0,
}) {
  const getMatchColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#10b981';
    if (score >= 60) return '#f97316';
    return '#6b7280';
  };

  const getMatchLabel = (score) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Great Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  const isWelcome = context === 'welcome';
  const count = properties.length;
  const propertyWord = count === 1 ? 'property' : 'properties';

  const title = isWelcome
    ? 'Your Initial Property Matches'
    : 'New Property Matches!';

  const subtitle = isWelcome
    ? 'Based on your preferences, here are properties we found for you.'
    : 'New properties have been listed that match your investment criteria.';

  const preview = isWelcome
    ? `We found ${count} ${propertyWord} matching your investment criteria`
    : `${count} new ${propertyWord} match your investment criteria`;

  return (
    <EmailLayout preview={preview}>
      <EmailHeader
        iconName="target"
        iconColor="#10b981"
        title={title}
        subtitle={subtitle}
      />

      {/* Intro count */}
      <Text style={introText}>
        We found <strong style={{ color: '#1f2937' }}>{count} {propertyWord}</strong> matching your criteria.
      </Text>

      {/* Property list */}
      {properties.map((property, index) => (
        <React.Fragment key={index}>
          {/* Match score badge */}
          <Section style={badgeSection}>
            <span style={{
              ...matchBadge,
              backgroundColor: getMatchColor(property.matchScore),
            }}>
              {property.matchScore}% {getMatchLabel(property.matchScore)}
            </span>
          </Section>

          {/* Property Card */}
          <PropertyCard
            propertyType={property.propertyType}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            propertyAddress={property.propertyAddress}
            propertyPrice={property.propertyPrice}
            availability={property.availability}
            propertyLicence={property.propertyLicence}
            condition={property.condition}
            propertyImage={property.propertyImage}
          />

          {/* View Property button */}
          <Section style={propertyButtonSection}>
            <Button href={property.propertyUrl} style={viewButton}>
              View Property
            </Button>
          </Section>

          {/* Divider between properties — omit after last */}
          {index < properties.length - 1 && <Hr style={hr} />}
        </React.Fragment>
      ))}

      {/* Next Steps */}
      <EmailBox variant="green-dark">
        <Heading as="h3" style={actionsHeading}>
          Next Steps
        </Heading>
        <Text style={actionText}>
          • Review the full property listings and photos
        </Text>
        <Text style={actionText}>
          • Check the yield calculator and investment returns
        </Text>
        <Text style={actionText}>
          • Request a viewing if you're interested
        </Text>
        <Text style={actionText}>
          • Save to your favorites for later review
        </Text>
        <Text style={actionText}>
          • Contact the landlord with any questions
        </Text>
      </EmailBox>

      {/* View All Matches button */}
      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          View All Matches
        </Button>
      </Section>

      <Text style={footerText}>
        Want to update your preferences? Visit your dashboard to adjust your property matching criteria.
      </Text>
    </EmailLayout>
  );
}

// Styles
const introText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 24px 0',
  lineHeight: '1.6',
  textAlign: 'center',
};

const badgeSection = {
  textAlign: 'center',
  marginBottom: '12px',
};

const matchBadge = {
  color: '#ffffff',
  padding: '6px 16px',
  borderRadius: '0',
  fontSize: '13px',
  fontWeight: '600',
  display: 'inline-block',
};

const propertyButtonSection = {
  textAlign: 'center',
  margin: '0 0 16px 0',
};

const viewButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const actionsHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const actionText = {
  color: '#065f46',
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
