import { Twilio } from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

export interface SMSService {
  sendSMS(to: string, message: string): Promise<boolean>;
  sendAppointmentReminder(
    phoneNumber: string,
    patientName: string,
    doctorName: string,
    appointmentDate: Date,
    consultationFee: number
  ): Promise<boolean>;
}

export class TwilioSMSService implements SMSService {
  private client: Twilio;
  private fromNumber: string;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio configuration is missing. Check environment variables.');
    }

    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      console.log('SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  generateAppointmentReminderMessage(
    patientName: string,
    doctorName: string,
    appointmentDate: Date,
    consultationFee: number
  ): string {
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Hi ${patientName}, this is a reminder about your appointment with Dr. ${doctorName} on ${formattedDate} at ${formattedTime}. Consultation fee: $${consultationFee}. Please arrive 10 minutes early. Reply CANCEL to cancel or RESCHEDULE to change your appointment.`;
  }

  async sendAppointmentReminder(
    phoneNumber: string,
    patientName: string,
    doctorName: string,
    appointmentDate: Date,
    consultationFee: number
  ): Promise<boolean> {
    const message = this.generateAppointmentReminderMessage(
      patientName,
      doctorName,
      appointmentDate,
      consultationFee
    );

    return this.sendSMS(phoneNumber, message);
  }
}

export class MockSMSService implements SMSService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    return true;
  }

  async sendAppointmentReminder(
    phoneNumber: string,
    patientName: string,
    doctorName: string,
    appointmentDate: Date,
    consultationFee: number
  ): Promise<boolean> {
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Hi ${patientName}, appointment reminder with Dr. ${doctorName} on ${formattedDate} at ${formattedTime}. Fee: $${consultationFee}.`;
    
    console.log(`[MOCK SMS] To: ${phoneNumber}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    return true;
  }
}

const smsService: SMSService = process.env.NODE_ENV === 'production' 
  ? new TwilioSMSService() 
  : new MockSMSService();

export default smsService;