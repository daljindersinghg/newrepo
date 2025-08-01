# Email Notification Setup

The clinic notification system includes email functionality that automatically sends professional emails to patients when clinics respond to appointment requests.

## 🚨 Important Note

**Email notifications are optional!** The system will work perfectly without email configuration. Notifications will still appear in the clinic dashboard and as browser notifications.

## 📧 Email Configuration

### Option 1: Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Generate a 16-character password
3. **Update your `.env` file**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=your-email@gmail.com
   ```

### Option 2: Other Email Providers

**Outlook/Hotmail:**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Yahoo:**
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

**SendGrid (Business):**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## 🧪 Testing Email Setup

1. **Check email status**:
   ```bash
   curl -H "Authorization: Bearer YOUR_CLINIC_TOKEN" \
        http://localhost:3001/api/v1/notifications/email-status
   ```

2. **Expected response**:
   ```json
   {
     "success": true,
     "emailService": {
       "configured": true,
       "connectionWorking": true,
       "host": "smtp.gmail.com",
       "port": "587",
       "user": "your-email@gmail.com"
     }
   }
   ```

## 📨 Email Templates

The system automatically sends three types of emails:

### 1. Appointment Confirmation
- **Trigger**: When clinic accepts an appointment request
- **Content**: Confirmation details with date, time, and clinic info

### 2. Alternative Time Suggestion  
- **Trigger**: When clinic suggests a different time
- **Content**: Comparison of original vs. suggested times with clinic message

### 3. Appointment Declined
- **Trigger**: When clinic declines an appointment request  
- **Content**: Polite decline message with clinic's reason

## 🛠️ Troubleshooting

### "Missing credentials for PLAIN" Error
- **Cause**: SMTP_USER or SMTP_PASS not set in environment variables
- **Solution**: Add credentials to `.env` file or emails will be skipped gracefully

### "Authentication failed" Error
- **Gmail**: Use App Password, not regular password
- **Outlook**: Enable "Less secure app access" or use App Password
- **Yahoo**: Use App Password

### "Connection timeout" Error
- **Check**: Firewall settings allowing outbound SMTP connections
- **Port**: Try port 465 with `SMTP_SECURE=true` for some providers

## 📊 Monitoring

The system logs all email activities:
- ✅ **Success**: `Email sent successfully`
- ⚠️ **Warning**: `Email service not configured - skipping email`
- ❌ **Error**: `Error sending email: [details]`

Check your logs at `api/logs/` for email delivery status.

## 🔒 Security Best Practices

1. **Never commit `.env` files** with real credentials
2. **Use App Passwords** instead of main account passwords
3. **Rotate credentials** periodically
4. **Monitor email logs** for unauthorized usage
5. **Consider rate limiting** for high-volume clinics

---

**Need help?** The notification system works great without emails too - patients will still get in-app notifications!