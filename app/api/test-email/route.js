import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { supabase } from '@/lib/supabase';
import ViewingConfirmation from '@/emails/investor/viewing-confirmation';
import ViewingRequest from '@/emails/landlord/viewing-request';
import ViewingRejected from '@/emails/investor/viewing-rejected';
import WelcomeInvestor from '@/emails/investor/welcome-investor';
import WelcomeLandlord from '@/emails/landlord/welcome-landlord';
import NewPropertyMatch from '@/emails/investor/new-property-match';
import NewInvestor from '@/emails/admin/new-investor';
import NewProperty from '@/emails/admin/new-property';

/**
 * Test Email Endpoint
 * GET /api/test-email?template=viewing-confirmation&to=your-email@example.com
 *
 * Query params:
 * - template: viewing-confirmation, viewing-request, viewing-rejected, welcome
 * - to: email address to send to (defaults to test email)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'viewing-confirmation';
    const toEmail = searchParams.get('to') || 'test@example.com';

    let emailComponent;
    let subject;

    // Sample data for testing
    const sampleProperty = {
      title: 'Beautiful 3 Bedroom House in Camden',
      address: '123 Nash Road, Camden, London, NW1 0AB',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop'
    };

    switch (template) {
      case 'viewing-confirmation':
        emailComponent = ViewingConfirmation({
          propertyTitle: sampleProperty.title,
          propertyAddress: sampleProperty.address,
          propertyImage: sampleProperty.image,
          viewingDate: '2026-01-20',
          viewingTime: '14:00',
          landlordName: 'John Smith',
          landlordPhone: '+44 7700 900000',
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`
        });
        subject = `Viewing Confirmed - ${sampleProperty.title}`;
        break;

      case 'viewing-request':
        emailComponent = ViewingRequest({
          propertyTitle: sampleProperty.title,
          propertyAddress: sampleProperty.address,
          viewerName: 'Jane Doe',
          viewerEmail: 'jane.doe@example.com',
          viewerPhone: '+44 7700 900001',
          viewerType: 'Investor',
          viewingDate: '2026-01-20',
          viewingTime: '14:00',
          message: 'I am very interested in viewing this property. I am looking for a buy-to-let investment in the Camden area.',
          approveLink: `${process.env.NEXT_PUBLIC_SITE_URL}/api/test-email?action=approve`,
          declineLink: `${process.env.NEXT_PUBLIC_SITE_URL}/api/test-email?action=decline`,
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/viewing-requests`
        });
        subject = `New Viewing Request - ${sampleProperty.title}`;
        break;

      case 'viewing-rejected':
        emailComponent = ViewingRejected({
          propertyTitle: sampleProperty.title,
          propertyAddress: sampleProperty.address,
          rejectionReason: 'Unfortunately, the property has already been let to another tenant.',
          browseLink: `${process.env.NEXT_PUBLIC_SITE_URL}/investor/property-matching`,
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`
        });
        subject = `Viewing Request Update - ${sampleProperty.title}`;
        break;

      case 'welcome-investor':
        emailComponent = WelcomeInvestor({
          name: 'Jane Doe',
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
          profileLink: `${process.env.NEXT_PUBLIC_SITE_URL}/investor/profile`,
          helpLink: `${process.env.NEXT_PUBLIC_SITE_URL}/help`
        });
        subject = 'Welcome to Ace Properties!';
        break;

      case 'welcome-landlord':
        emailComponent = WelcomeLandlord({
          name: 'John Smith',
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
          profileLink: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/profile`,
          helpLink: `${process.env.NEXT_PUBLIC_SITE_URL}/help`
        });
        subject = 'Welcome to Ace Properties!';
        break;

      case 'new-property-match':
        // Try to fetch a real property with photos from the database, fallback to mock data
        const { data: property } = await supabase
          .from('properties')
          .select('id, property_type, bedrooms, bathrooms, monthly_rent, address, city, postcode, photos, availability, property_licence, property_condition, amenities, description')
          .not('photos', 'is', null)
          .filter('photos', 'neq', '{}')
          .limit(1)
          .maybeSingle();

        // Use real property data if available, otherwise use mock data
        const propertyData = property || {
          id: 'mock-123',
          property_type: 'Apartment',
          bedrooms: 2,
          bathrooms: 1,
          monthly_rent: 120000, // stored in pence (£1,200)
          address: '123 Nash Road',
          city: 'London',
          postcode: 'E1 1AA',
          photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop'],
          availability: 'vacant',
          property_licence: 'hmo',
          property_condition: 'excellent',
          amenities: ['Garden', 'Parking', 'Close to Transport'],
          description: 'Beautiful property in excellent condition'
        };

        const propertyImages = propertyData.photos || [];
        const mainImage = propertyImages[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop';

        // Format address: remove door number and only use outward postcode
        const addressWithoutNumber = propertyData.address.replace(/^\d+\s*/, '');
        const outwardPostcode = (propertyData.postcode?.split(' ')[0] || propertyData.postcode).toUpperCase();
        const formattedCity = propertyData.city.charAt(0).toUpperCase() + propertyData.city.slice(1).toLowerCase();

        emailComponent = NewPropertyMatch({
          propertyType: propertyData.property_type,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          propertyAddress: `${addressWithoutNumber}, ${formattedCity}, ${outwardPostcode}`,
          propertyImage: mainImage,
          propertyPrice: (propertyData.monthly_rent / 100)?.toLocaleString(),
          availability: propertyData.availability,
          propertyLicence: propertyData.property_licence,
          condition: propertyData.property_condition,
          amenities: propertyData.amenities || [],
          description: propertyData.description,
          matchScore: 95,
          propertyUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/properties/${propertyData.id}`,
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`
        });
        subject = 'New Property Match!';
        break;

      case 'new-investor':
        emailComponent = NewInvestor({
          investorName: 'James Okafor',
          investorEmail: 'james.okafor@example.com',
          investorPhone: '+44 7700 900123',
          operatorType: 'hands-off',
          budgetMin: 1200,
          budgetMax: 2500,
          budgetType: 'monthly',
          bedroomsMin: 2,
          bedroomsMax: 4,
          propertyTypes: ['HMO', 'Apartment'],
          propertyLicences: ['HMO Licence'],
          locations: ['East London', 'North London'],
          propertiesManaging: 0,
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
        });
        subject = 'New Investor Registered';
        break;

      case 'new-property': {
        const { data: landlordProperty } = await supabase
          .from('properties')
          .select('id, address, city, postcode, monthly_rent, bedrooms, bathrooms, property_type, availability, property_licence, property_condition, photos')
          .not('photos', 'is', null)
          .filter('photos', 'neq', '{}')
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

        const lp = landlordProperty || {
          address: 'Mathias Walk',
          city: 'Basingstoke',
          postcode: 'RG22 4BZ',
          monthly_rent: 155000,
          bedrooms: 3,
          bathrooms: 1,
          property_type: 'House',
          availability: 'vacant',
          property_licence: 'none',
          property_condition: 'good',
          photos: []
        };

        const lpAddressWithoutNumber = lp.address.replace(/^\d+\s*/, '');
        const lpOutwardPostcode = (lp.postcode?.split(' ')[0] || lp.postcode).toUpperCase();
        const lpCity = lp.city.charAt(0).toUpperCase() + lp.city.slice(1).toLowerCase();

        emailComponent = NewProperty({
          submittedByName: 'Sarah Mitchell',
          submittedByEmail: 'sarah.mitchell@example.com',
          submittedByPhone: '+44 7700 900456',
          dashboardLink: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
          propertyAddress: `${lpAddressWithoutNumber}, ${lpCity}, ${lpOutwardPostcode}`,
          propertyType: lp.property_type,
          propertyPrice: (lp.monthly_rent / 100).toLocaleString(),
          bedrooms: lp.bedrooms,
          bathrooms: lp.bathrooms,
          availability: lp.availability,
          propertyLicence: lp.property_licence,
          condition: lp.property_condition,
          propertyImage: lp.photos?.[0] || ''
        });
        subject = 'New Landlord Registered';
        break;
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid template',
            availableTemplates: [
              'viewing-confirmation',
              'viewing-request',
              'viewing-rejected',
              'welcome-investor',
              'welcome-landlord',
              'new-property-match',
              'new-investor',
              'new-property'
            ]
          },
          { status: 400 }
        );
    }

    // Send the email
    const result = await sendEmail({
      to: toEmail,
      subject: `[TEST] ${subject}`,
      react: emailComponent
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${toEmail}`,
        template,
        result: result.data
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          details: result.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
