import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
  Img,
  Head,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from '../components/email-layout';
import { EmailIcon } from '../components/email-icon';

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
  amenities = [],
  description = '',
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

  const getLicenceDisplay = (licence) => {
    switch (licence) {
      case 'hmo': return 'HMO Licence';
      case 'c2': return 'C2 Licence';
      case 'selective': return 'Selective Licence';
      case 'additional': return 'Additional Licence';
      case 'other': return 'Licensed';
      case 'none': return null;
      default: return null;
    }
  };

  const getConditionDisplay = (cond) => {
    switch (cond) {
      case 'excellent': return 'Excellent';
      case 'newly-renovated': return 'Newly Renovated';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'needs-work': return 'Needs Work';
      default: return null;
    }
  };

  const getAvailabilityLabel = (avail) => {
    switch (avail) {
      case 'vacant': return 'Vacant';
      case 'tenanted': return 'Tenanted';
      case 'upcoming': return 'Upcoming';
      default: return 'Available';
    }
  };

  const getAvailabilityColor = (avail) => {
    switch (avail) {
      case 'vacant': return '#10b981'; // green
      case 'tenanted': return '#dc2626'; // red
      case 'upcoming': return '#f97316'; // orange
      default: return '#6b7280'; // gray
    }
  };

  return (
    <EmailLayout preview="New property match! Check out this investment opportunity">
      <Head>
        <style>{`
          /* Responsive styles for desktop */
          @media screen and (min-width: 600px) {
            .property-container {
              display: table !important;
              width: 100% !important;
            }
            .property-image-cell {
              display: table-cell !important;
              width: 45% !important;
              vertical-align: top !important;
              padding-right: 16px !important;
            }
            .property-details-cell {
              display: table-cell !important;
              width: 55% !important;
              vertical-align: top !important;
            }
            .property-image-mobile {
              margin-bottom: 0 !important;
            }
          }
        `}</style>
      </Head>

      {/* Icon + Title */}
      <Section style={titleSection}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <EmailIcon name="target" color="#10b981" size={48} />
        </div>
        <Heading style={heading}>New Property Match!</Heading>
        <Text style={subtitle}>
          We found a property that matches your investment preferences.
        </Text>
      </Section>

      {/* Match Score Badge */}
      <Section style={badgeSection}>
        <span style={{
          ...matchBadge,
          backgroundColor: getMatchColor(matchScore),
        }}>
          {matchScore}% {getMatchLabel(matchScore)}
        </span>
      </Section>

      {/* Property Box - Responsive layout */}
      <Section style={propertyBox}>
        <div className="property-container" style={{ display: 'block', width: '100%' }}>
          {/* Image - stacks on top for mobile, left side for desktop */}
          <div className="property-image-cell" style={{ display: 'block', width: '100%' }}>
            {propertyImage && (
              <Img
                src={propertyImage}
                alt={propertyAddress}
                className="property-image-mobile"
                style={propertyImageStyle}
              />
            )}
          </div>

          {/* Details - below image for mobile, right side for desktop */}
          <div className="property-details-cell" style={{ display: 'block', width: '100%' }}>
            {/* Address */}
            <Heading as="h2" style={propertyAddressHeading}>
              {propertyAddress}
            </Heading>

            {/* Price */}
            <Text style={propertyPriceStyle}>
              £{propertyPrice} pcm
            </Text>

            {/* Badges */}
            <div style={{ marginTop: '12px', marginBottom: '16px' }}>
              <span style={{
                ...badge,
                backgroundColor: getAvailabilityColor(availability),
                marginRight: '8px',
                marginBottom: '8px',
              }}>
                {getAvailabilityLabel(availability)}
              </span>

              {getLicenceDisplay(propertyLicence) && (
                <span style={{
                  ...badge,
                  backgroundColor: '#1a1a2e',
                  marginRight: '8px',
                  marginBottom: '8px',
                }}>
                  {getLicenceDisplay(propertyLicence)}
                </span>
              )}

              {getConditionDisplay(condition) && (
                <span style={{
                  ...badge,
                  backgroundColor: '#6b7280',
                  marginBottom: '8px',
                }}>
                  {getConditionDisplay(condition)}
                </span>
              )}
            </div>

            {/* Property details with icons */}
            <Text style={propertyDetailsRow}>
              <span style={propertyDetailItem}>{propertyType}</span>
              <span style={propertyDetailItem}>🛏️ {bedrooms} bed</span>
              <span style={propertyDetailItem}>🛁 {bathrooms} bath</span>
            </Text>

            {/* Features */}
            {amenities && amenities.length > 0 && (
              <Text style={featuresText}>
                <strong>Features:</strong> {amenities.join(', ')}
              </Text>
            )}

            {/* Description */}
            {description && (
              <Text style={descriptionText}>
                <strong>Description:</strong><br />
                {description}
              </Text>
            )}
          </div>
        </div>
      </Section>

      {/* Match Details Box */}
      <Section style={matchBox}>
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
                  { label: 'Location', score: matchBreakdown.location, weight: '50%' },
                  { label: 'Price', score: matchBreakdown.price, weight: '30%' },
                  { label: 'Bedrooms', score: matchBreakdown.bedrooms, weight: '15%' },
                  { label: 'Property Type', score: matchBreakdown.type, weight: '5%' },
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
      </Section>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={propertyUrl} style={viewButton}>
          View Full Property Details
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Quick Actions - Green Box */}
      <Section style={actionsBox}>
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
      </Section>

      {/* Tip Box */}
      <Section style={tipBox}>
        <Text style={tipText}>
          <strong>Tip:</strong> Properties that match your criteria get snapped up quickly. Act fast to secure the best investment opportunities!
        </Text>
      </Section>

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

const badgeSection = {
  textAlign: 'center',
  marginBottom: '24px',
};

const matchBadge = {
  color: '#ffffff',
  padding: '8px 20px',
  borderRadius: '0',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const propertyBox = {
  border: '2px solid #e5e7eb',
  borderRadius: '0',
  padding: '16px',
  marginBottom: '24px',
  backgroundColor: '#ffffff',
};

const propertyImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  display: 'block',
  marginBottom: '16px',
};

const propertyAddressHeading = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
};

const propertyPriceStyle = {
  color: '#10b981',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const badge = {
  color: '#ffffff',
  padding: '4px 12px',
  borderRadius: '0',
  fontSize: '12px',
  fontWeight: '600',
  display: 'inline-block',
};

const propertyDetailsRow = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 12px 0',
  lineHeight: '1.6',
};

const propertyDetailItem = {
  display: 'inline-block',
  marginRight: '16px',
  whiteSpace: 'nowrap',
};

const featuresText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '12px 0 8px 0',
  lineHeight: '1.6',
};

const descriptionText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '12px 0 0 0',
  lineHeight: '1.6',
};

const matchBox = {
  backgroundColor: '#ffffff',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
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
  margin: '32px 0',
};

const viewButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const actionsBox = {
  backgroundColor: '#f8f9fa', borderLeft: '4px solid #10b981',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
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

const tipBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '0',
  padding: '15px 20px',
  marginBottom: '24px',
};

const tipText = {
  color: '#78350f',
  fontSize: '14px',
  margin: 0,
  lineHeight: '22px',
};

const dashboardSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
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
