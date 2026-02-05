import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import ViewingConfirmation from '@/emails/investor/viewing-confirmation';
import ViewingRequest from '@/emails/landlord/viewing-request';
import ViewingRejected from '@/emails/investor/viewing-rejected';
import WelcomeInvestor from '@/emails/investor/welcome-investor';
import WelcomeLandlord from '@/emails/landlord/welcome-landlord';

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

      default:
        return NextResponse.json(
          {
            error: 'Invalid template',
            availableTemplates: [
              'viewing-confirmation',
              'viewing-request',
              'viewing-rejected',
              'welcome-investor',
              'welcome-landlord'
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
