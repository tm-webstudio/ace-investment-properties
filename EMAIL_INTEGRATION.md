# Email Integration Guide

## Overview

This application uses **Resend** for transactional emails and **React Email** for beautiful, responsive email templates. All emails are integrated into the application's workflow.

## Components

### Email Templates (`/emails`)

1. **ViewingConfirmation.jsx** - Sent when a landlord approves a viewing request
2. **ViewingRequest.jsx** - Sent to landlord when someone requests a viewing
3. **ViewingRejected.jsx** - Sent when a landlord declines a viewing request
4. **Welcome.jsx** - Sent to new users upon signup (different content for investors vs landlords)
5. **DocumentExpiring.jsx** - Sent to landlords when documents are expiring (30, 14, 7 days)
6. **PasswordReset.jsx** - Sent when user requests password reset

### Utilities

- **lib/email.js** - Core email sending functions using Resend
- **lib/emailHelpers.js** - Helper functions for formatting dates, times, addresses, etc.

### API Integration

Emails are automatically sent from these endpoints:

- `POST /api/viewings/request` → Sends **ViewingRequest** to landlord
- `PUT /api/viewings/:id/approve` → Sends **ViewingConfirmation** to requester
- `PUT /api/viewings/:id/reject` → Sends **ViewingRejected** to requester
- `POST /api/auth/signup` → Sends **Welcome** to new user

### Background Jobs

- **lib/jobs/checkExpiringDocuments.js** - Daily check for expiring documents
- **api/cron/check-expiring-documents** - Cron endpoint for automated checks

## Configuration

### Environment Variables

Required in `.env.local` and Vercel:

```env
RESEND_API_KEY=re_xxx...
NEXT_PUBLIC_SITE_URL=https://aceinvestmentproperties.co.uk
SUPABASE_SERVICE_ROLE_KEY=xxx... (for background jobs)
CRON_SECRET=your-secret-here (for cron endpoint protection)
```

### Vercel Cron Setup

The `vercel.json` file configures automatic daily document expiry checks:

```json
{
  "crons": [{
    "path": "/api/cron/check-expiring-documents",
    "schedule": "0 9 * * *"
  }]
}
```

This runs every day at 9:00 AM UTC.

## Testing

### Preview All Templates

Start the React Email preview server:

```bash
npx react-email dev
```

Visit http://localhost:3006 to preview all templates with live editing.

### Test Sending Emails

Use the test endpoint to send real emails:

```bash
# Test viewing confirmation
curl "http://localhost:3000/api/test-email?template=viewing-confirmation&to=your@email.com"

# Test viewing request
curl "http://localhost:3000/api/test-email?template=viewing-request&to=your@email.com"

# Test viewing rejected
curl "http://localhost:3000/api/test-email?template=viewing-rejected&to=your@email.com"

# Test welcome email (investor)
curl "http://localhost:3000/api/test-email?template=welcome-investor&to=your@email.com"

# Test welcome email (landlord)
curl "http://localhost:3000/api/test-email?template=welcome-landlord&to=your@email.com"

# Test document expiring
curl "http://localhost:3000/api/test-email?template=document-expiring&to=your@email.com"

# Test document expired
curl "http://localhost:3000/api/test-email?template=document-expired&to=your@email.com"
```

### Test Document Expiry Cron Job

```bash
# Dry run (no emails sent, just logs what would happen)
curl -H "Authorization: Bearer your-cron-secret-here" \
  "http://localhost:3000/api/cron/check-expiring-documents?dryRun=true"

# Real run (sends emails)
curl -H "Authorization: Bearer your-cron-secret-here" \
  "http://localhost:3000/api/cron/check-expiring-documents"
```

## How It Works

### 1. Viewing Request Flow

1. User submits viewing request → `POST /api/viewings/request`
2. Viewing created in database
3. **Email sent to landlord** with ViewingRequest template
4. Landlord receives email with approve/decline buttons

### 2. Viewing Approval Flow

1. Landlord clicks approve → `PUT /api/viewings/:id/approve`
2. Viewing status updated to "approved"
3. **Email sent to requester** with ViewingConfirmation template
4. Requester receives email with viewing details, calendar link, and directions

### 3. Viewing Rejection Flow

1. Landlord clicks decline → `PUT /api/viewings/:id/reject`
2. Viewing status updated to "rejected"
3. **Email sent to requester** with ViewingRejected template
4. Requester receives encouraging email with alternative property suggestions

### 4. User Signup Flow

1. User completes signup → `POST /api/auth/signup`
2. User account created in Supabase
3. User profile created in database
4. **Welcome email sent** with role-specific content
5. User receives email with dashboard link and getting started guide

### 5. Document Expiry Flow

1. Vercel Cron runs daily at 9 AM UTC
2. Job queries database for documents expiring in 30, 14, or 7 days
3. **Email sent to landlord** for each expiring document
4. Landlord receives reminder with upload link

## Email Design Guidelines

All templates follow these standards:

### Colors

- **Primary Blue**: `#0066cc` - CTAs, links
- **Success Green**: `#10b981` - Confirmations
- **Error Red**: `#ef4444` - Rejections, urgent
- **Warning Orange**: `#f97316` - Warnings, expiring documents
- **Neutral**: `#1a1a1a` - Text, secondary buttons

### Layout

- **Container width**: 600px max
- **Font**: Arial, sans-serif
- **Responsive**: Single column for mobile
- **Inline CSS**: Required for email client compatibility

### Components

- **EmailLayout wrapper**: Consistent header, footer, branding
- **Clear CTAs**: Large, colorful buttons
- **Property cards**: Image, title, address
- **Status indicators**: Color-coded sections
- **Help text**: Support contact in footer

## Error Handling

All email sends are wrapped in try-catch blocks:

```javascript
try {
  await sendEmail({ ... })
} catch (emailError) {
  console.error('Failed to send email:', emailError)
  // Don't fail the main operation if email fails
}
```

This ensures that failed emails never block critical user actions like creating viewings or signing up.

## Monitoring

### Check Email Logs

Resend dashboard: https://resend.com/emails

### Check Cron Job Logs

Vercel dashboard → Your Project → Logs → Filter by `/api/cron`

### Common Issues

1. **Emails not sending**
   - Check `RESEND_API_KEY` is set in Vercel
   - Verify sender domain `aceinvestmentproperties.co.uk` is verified in Resend
   - Check Resend dashboard for failed sends

2. **Cron job not running**
   - Check `vercel.json` is deployed
   - Verify `CRON_SECRET` is set
   - Check Vercel cron logs

3. **Templates not rendering**
   - Ensure all props are passed correctly
   - Check browser console for React errors
   - Test in preview server first

## Best Practices

1. **Always test emails** before deploying changes
2. **Use preview server** to iterate on design
3. **Monitor send rates** to avoid Resend limits
4. **Keep templates simple** for email client compatibility
5. **Include plain text versions** for accessibility (auto-generated by Resend)
6. **Test on multiple clients** (Gmail, Outlook, Apple Mail, mobile)

## Customization

### Adding New Email Templates

1. Create new template in `/emails/YourTemplate.jsx`
2. Import and use `EmailLayout` wrapper
3. Add test case to `/api/test-email/route.js`
4. Test in preview server
5. Integrate into appropriate API route

### Modifying Existing Templates

1. Edit template in `/emails/`
2. Preview changes: `npx react-email dev`
3. Test sending: use `/api/test-email`
4. Deploy when satisfied

## Support

- **Resend Docs**: https://resend.com/docs
- **React Email Docs**: https://react.email/docs
- **Troubleshooting**: Check Resend dashboard and Vercel logs
