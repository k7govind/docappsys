# Automated Appointment Reminders

This document explains how to set up and use the automated appointment reminder system.

## Features

- **Email Reminders**: Professional HTML email templates with appointment details
- **SMS Reminders**: Text message notifications via Twilio
- **Automated Scheduling**: Cron jobs run automatically at 9 AM (daily) and 6 PM (next-day)
- **Customizable Preferences**: Patients can choose email/SMS and reminder timing
- **Manual Reminders**: Send immediate reminders for specific appointments
- **Status Tracking**: Monitor which reminders have been sent

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=DocApp System <noreply@docapp.com>

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Email Setup (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the app password as `SMTP_PASS`

### 4. SMS Setup (Twilio)

1. Create a Twilio account at https://www.twilio.com
2. Purchase a phone number or use the trial number
3. Get your Account SID and Auth Token from the Twilio console
4. Add the credentials to your `.env` file

## API Endpoints

### Reminder Management

#### Send Manual Reminder
```http
POST /api/appointments/:id/remind
```

#### Update Reminder Preferences
```http
PUT /api/appointments/:id/reminder-preferences
Content-Type: application/json

{
  "email": true,
  "sms": true,
  "reminderTime": 24
}
```

#### Get Reminder Status
```http
GET /api/appointments/:id/reminder-status
```

#### Test Reminder Job
```http
POST /api/appointments/test-reminder-job
```

#### Get Job Status
```http
GET /api/appointments/reminder-job/status
```

## Database Schema Updates

The appointment model now includes:

```typescript
interface IAppointment {
  // ... existing fields
  emailReminderSent?: boolean;
  smsReminderSent?: boolean;
  reminderPreferences?: {
    email: boolean;
    sms: boolean;
    reminderTime: number; // hours before appointment
  };
  lastReminderSent?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Scheduler Configuration

The system runs two automated jobs:

1. **Daily Reminders (9 AM)**: Sends reminders for appointments scheduled for tomorrow
2. **Next-Day Reminders (6 PM)**: Sends reminders for appointments scheduled for day after tomorrow

## Testing

### Test Email Service
Create a test appointment and use the manual reminder endpoint to verify email delivery.

### Test SMS Service
In development mode, SMS messages are logged to the console instead of being sent.

### Test Scheduler
Use the test endpoint to run the reminder job manually:

```bash
curl -X POST http://localhost:3000/api/appointments/test-reminder-job
```

## Monitoring

Check the reminder job status:

```bash
curl http://localhost:3000/api/appointments/reminder-job/status
```

## Troubleshooting

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check if Gmail app password is correct
- Ensure `SMTP_USER` and `EMAIL_FROM` are properly set

### SMS Not Sending
- Verify Twilio credentials in `.env`
- Check if Twilio phone number is valid
- Ensure recipient phone number is in E.164 format

### Job Not Running
- Ensure the server is running during scheduled times
- Check server logs for any errors
- Verify the reminder service is imported in `src/app.ts`

## Production Considerations

1. **Use Production Email Service**: Consider services like SendGrid or Mailgun for better deliverability
2. **Set Up Error Monitoring**: Add logging and error tracking for reminder failures
3. **Rate Limiting**: Implement rate limiting for SMS to avoid Twilio limits
4. **Database Indexing**: Ensure proper indexes on appointment date fields
5. **Backup Reminders**: Consider multiple reminder attempts for failed sends