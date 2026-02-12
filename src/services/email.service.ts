import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  generateAppointmentReminderEmail(
    patientName: string,
    doctorName: string,
    appointmentDate: Date,
    doctorSpecialization: string,
    consultationFee: number
  ): { html: string; text: string; subject: string } {
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const subject = `Appointment Reminder: Consultation with Dr. ${doctorName} on ${formattedDate}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Reminder</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${patientName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder about your upcoming appointment. We're looking forward to seeing you!
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Appointment Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Doctor:</strong> Dr. ${doctorName}</li>
              <li><strong>Specialization:</strong> ${doctorSpecialization}</li>
              <li><strong>Date:</strong> ${formattedDate}</li>
              <li><strong>Time:</strong> ${formattedTime}</li>
              <li><strong>Consultation Fee:</strong> $${consultationFee}</li>
            </ul>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <p style="color: #856404; margin: 0; font-weight: 500;">
              <strong>Important:</strong> Please arrive 10 minutes before your scheduled appointment time.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; margin-bottom: 15px;">If you need to reschedule or cancel, please contact us at:</p>
            <p style="color: #667eea; font-weight: bold; margin: 0;">support@docapp.com | +1 (555) 123-4567</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
      Appointment Reminder
      
      Hello ${patientName},
      
      This is a friendly reminder about your upcoming appointment.
      
      Appointment Details:
      - Doctor: Dr. ${doctorName}
      - Specialization: ${doctorSpecialization}
      - Date: ${formattedDate}
      - Time: ${formattedTime}
      - Consultation Fee: $${consultationFee}
      
      Important: Please arrive 10 minutes before your scheduled appointment time.
      
      If you need to reschedule or cancel, please contact us at:
      support@docapp.com | +1 (555) 123-4567
      
      This is an automated message. Please do not reply to this email.
    `;

    return { html, text, subject };
  }

  async sendAppointmentReminder(
    patientEmail: string,
    patientName: string,
    doctorName: string,
    appointmentDate: Date,
    doctorSpecialization: string,
    consultationFee: number
  ): Promise<boolean> {
    const emailContent = this.generateAppointmentReminderEmail(
      patientName,
      doctorName,
      appointmentDate,
      doctorSpecialization,
      consultationFee
    );

    return this.sendEmail({
      to: patientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  }
}

export default new EmailService();