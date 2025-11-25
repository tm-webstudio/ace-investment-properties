import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, react }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Ace Properties <noreply@aceinvestmentproperties.co.uk>',
      to,
      subject,
      react
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
}

// Helper for multiple recipients
export async function sendBulkEmail({ recipients, subject, react }) {
  const results = await Promise.allSettled(
    recipients.map(to => sendEmail({ to, subject, react }))
  );
  return results;
}
