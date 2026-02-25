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

export default function NewPropertyMatch({
  propertyType = 'Apartment',
  bedrooms = 2,
  bathrooms = 1,
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyImage = '',
  propertyPrice = '1,200',
  availability = 'vacant',
  propertyLicence = 'hmo',
  condition = 'excellent',
  matchScore = 95,
  matchBreakdown = null,
  propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/properties/123`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
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

  return (
    <EmailLayout preview="New property match! Check out this investment opportunity">
      <EmailHeader
        iconName="target"
        iconColor="#10b981"
        title="New Property Match!"
        subtitle="We found a property that matches your investment preferences."
      />

      {/* Match Score Badge */}
      <Section style={badgeSection}>
        <span style={{
          ...matchBadge,
          backgroundColor: getMatchColor(matchScore),
        }}>
          {matchScore}% {getMatchLabel(matchScore)}
        </span>
      </Section>

      {/* Property Card */}
      <PropertyCard
        propertyType={propertyType}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        propertyAddress={propertyAddress}
        propertyPrice={propertyPrice}
        availability={availability}
        propertyLicence={propertyLicence}
        condition={condition}
        propertyImage={propertyImage}
      />

      {/* Match Details Box */}
      <EmailBox variant="plain-white">
        <Heading as="h3" style={matchHeading}>
          Why This Property Matches
        </Heading>
        {matchBreakdown ? (
          <>
            <Text style={matchText}>
              Here's how this property scores against your preferences:
            </Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  { label: 'Location', score: matchBreakdown.location },
                  { label: 'Price', score: matchBreakdown.price },
                  { label: 'Bedrooms', score: matchBreakdown.bedrooms },
                  { label: 'Property Type', score: matchBreakdown.type },
                ].map((item) => (
                  <tr key={item.label}>
                    <td style={breakdownLabel}>{item.label}</td>
                    <td style={breakdownBarCell}>
                      <div style={breakdownBarBg}>
                        <div style={{
                          ...breakdownBarFill,
                          width: `${item.score}%`,
                          backgroundColor: item.score >= 80 ? '#10b981' : item.score >= 60 ? '#f59e0b' : '#9ca3af',
                        }} />
                      </div>
                    </td>
                    <td style={breakdownScore}>{item.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <Text style={matchText}>
              This property matches your preferences based on:
            </Text>
            <Text style={matchItem}>Location preferences</Text>
            <Text style={matchItem}>Price range</Text>
            <Text style={matchItem}>Property type</Text>
            <Text style={matchItem}>Bedroom requirements</Text>
          </>
        )}
      </EmailBox>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={propertyUrl} style={viewButton}>
          View Full Property Details
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Next Steps */}
      <EmailBox variant="green-dark">
        <Heading as="h3" style={actionsHeading}>
          Next Steps
        </Heading>
        <Text style={actionText}>
          • Review the full property listing and photos
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

      {/* Tip Box */}
      <EmailBox variant="plain">
        <Text style={tipText}>
          <strong>Tip:</strong> Properties that match your criteria get snapped up quickly. Act fast to secure the best investment opportunities!
        </Text>
      </EmailBox>

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
const badgeSection = {
  textAlign: 'center',
  marginBottom: '24px',
};

const matchBadge = {
  color: '#ffffff',
  padding: '6px 16px',
  borderRadius: '0',
  fontSize: '13px',
  fontWeight: '600',
  display: 'inline-block',
};

const matchHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const matchText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 12px 0',
  lineHeight: '22px',
};

const matchItem = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '6px 0',
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

const tipText = {
  color: '#78350f',
  fontSize: '14px',
  margin: 0,
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

const breakdownLabel = {
  color: '#374151',
  fontSize: '13px',
  fontWeight: '500',
  padding: '6px 8px 6px 0',
  whiteSpace: 'nowrap',
  width: '100px',
};

const breakdownBarCell = {
  padding: '6px 8px',
  width: '100%',
};

const breakdownBarBg = {
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  height: '8px',
  width: '100%',
  overflow: 'hidden',
};

const breakdownBarFill = {
  height: '8px',
  borderRadius: '4px',
};

const breakdownScore = {
  color: '#374151',
  fontSize: '13px',
  fontWeight: '600',
  padding: '6px 0 6px 8px',
  whiteSpace: 'nowrap',
  textAlign: 'right',
  width: '40px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};
