# Email Templates

This directory contains React Email templates for Ace Investment Properties.

## Usage

### Sending an Email

```javascript
import { sendEmail } from '@/lib/email';
import WelcomeEmail from '@/emails/welcome-email';

// Send a welcome email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Ace Properties',
  react: <WelcomeEmail name="John Doe" />
});
```

### Sending Bulk Emails

```javascript
import { sendBulkEmail } from '@/lib/email';
import PropertyAlert from '@/emails/property-alert';

// Send to multiple recipients
await sendBulkEmail({
  recipients: ['user1@example.com', 'user2@example.com'],
  subject: 'New Property Match',
  react: <PropertyAlert propertyData={propertyData} />
});
```

## Available Templates

- **welcome-email.jsx** - Welcome email for new users

## Creating New Templates

1. Create a new `.jsx` file in this directory
2. Import React Email components from `@react-email/components`
3. Export a default React component
4. Use the template with the `sendEmail` function

## Testing Templates Locally

Run the React Email development server:

```bash
npm run email:dev
```

This will start a local server where you can preview and test your email templates.

## Environment Variables Required

- `RESEND_API_KEY` - Your Resend API key
- `NEXT_PUBLIC_SITE_URL` - Your site URL for links in emails
