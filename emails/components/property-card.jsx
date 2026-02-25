import { Heading, Text, Section, Img, Head } from '@react-email/components';
import * as React from 'react';

/**
 * Reusable property card for email templates.
 * Two-column layout: image (or placeholder) on the left, details on the right.
 */
export default function PropertyCard({
  propertyType = 'Apartment',
  bedrooms = 2,
  bathrooms = 1,
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyPrice = '1,200',
  availability = 'vacant',
  propertyLicence = 'hmo',
  condition = 'excellent',
  propertyImage = '',
}) {
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
      case 'vacant': return '#10b981';
      case 'tenanted': return '#dc2626';
      case 'upcoming': return '#f97316';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <Head>
        <style>{`
          @media screen and (min-width: 600px) {
            .pc-container {
              display: table !important;
              width: 100% !important;
            }
            .pc-image-cell {
              display: table-cell !important;
              width: 45% !important;
              vertical-align: top !important;
              padding-right: 16px !important;
            }
            .pc-details-cell {
              display: table-cell !important;
              width: 55% !important;
              vertical-align: top !important;
            }
            .pc-image-mobile {
              margin-bottom: 0 !important;
            }
          }
        `}</style>
      </Head>

      <Section style={cardBox}>
        <div className="pc-container" style={{ display: 'block', width: '100%' }}>
          {/* Left: image or placeholder */}
          <div className="pc-image-cell" style={{ display: 'block', width: '100%', marginBottom: '16px' }}>
            {propertyImage && (
              <Img
                src={propertyImage}
                alt={propertyAddress}
                className="pc-image-mobile"
                style={imageStyle}
              />
            )}
          </div>

          {/* Right: details */}
          <div className="pc-details-cell" style={{ display: 'block', width: '100%' }}>
            <Heading as="h2" style={addressHeading}>
              {propertyAddress}
            </Heading>

            <Text style={priceStyle}>£{propertyPrice} pcm</Text>

            <div style={{ marginTop: '12px', marginBottom: '16px' }}>
              <span style={{ ...badge, backgroundColor: getAvailabilityColor(availability), marginRight: '8px' }}>
                {getAvailabilityLabel(availability)}
              </span>

              {getLicenceDisplay(propertyLicence) && (
                <span style={{ ...badge, backgroundColor: '#1a1a2e', marginRight: '8px' }}>
                  {getLicenceDisplay(propertyLicence)}
                </span>
              )}

              {getConditionDisplay(condition) && (
                <span style={{ ...badge, backgroundColor: '#6b7280' }}>
                  {getConditionDisplay(condition)}
                </span>
              )}
            </div>

            <Text style={detailsRow}>
              <span style={detailItem}>{propertyType}</span>
              <span style={detailItem}>🛏️ {bedrooms} bed</span>
              <span style={detailItem}>🛁 {bathrooms} bath</span>
            </Text>
          </div>
        </div>
      </Section>
    </>
  );
}

const cardBox = {
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: '0',
  padding: '16px',
  marginBottom: '24px',
};

const imageStyle = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const addressHeading = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
};

const priceStyle = {
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

const detailsRow = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.6',
};

const detailItem = {
  display: 'inline-block',
  marginRight: '16px',
  whiteSpace: 'nowrap',
};
