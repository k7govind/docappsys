import cron from 'node-cron';
import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import emailService from './email.service.js';
import smsService from './sms.service.js';

export interface ReminderJobResult {
  totalChecked: number;
  emailRemindersSent: number;
  smsRemindersSent: number;
  errors: string[];
}

export class ReminderSchedulerService {
  private isJobRunning: boolean = false;

  constructor() {
    this.initializeScheduler();
  }

  private initializeScheduler(): void {
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily appointment reminder job at 9 AM');
      await this.sendDailyReminders();
    });

    cron.schedule('0 18 * * *', async () => {
      console.log('Running next-day appointment reminder job at 6 PM');
      await this.sendNextDayReminders();
    });
  }

  async sendDailyReminders(): Promise<ReminderJobResult> {
    if (this.isJobRunning) {
      console.log('Reminder job is already running. Skipping...');
      return { totalChecked: 0, emailRemindersSent: 0, smsRemindersSent: 0, errors: ['Job already running'] };
    }

    this.isJobRunning = true;
    const result: ReminderJobResult = {
      totalChecked: 0,
      emailRemindersSent: 0,
      smsRemindersSent: 0,
      errors: []
    };

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        PatientAppointmentDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        AppointmentStatus: 'scheduled'
      }).populate('DocID');

      result.totalChecked = appointments.length;

      console.log(`Found ${appointments.length} appointments for tomorrow`);

      for (const appointment of appointments) {
        try {
          const doctor = await Doctor.findOne({ doctorId: appointment.DocID });
          if (!doctor) {
            result.errors.push(`Doctor not found for appointment ${appointment._id}`);
            continue;
          }

          const patientName = this.extractPatientName(appointment.PatientEmail);
          
          const emailSent = await emailService.sendAppointmentReminder(
            appointment.PatientEmail,
            patientName,
            `${doctor.firstName} ${doctor.lastName}`,
            appointment.PatientAppointmentDate,
            doctor.specialization,
            doctor.consultationFee
          );

          if (emailSent) {
            result.emailRemindersSent++;
          }

          const smsSent = await smsService.sendAppointmentReminder(
            appointment.PatientAddress,
            patientName,
            `${doctor.firstName} ${doctor.lastName}`,
            appointment.PatientAppointmentDate,
            doctor.consultationFee
          );

          if (smsSent) {
            result.smsRemindersSent++;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          result.errors.push(`Error processing appointment ${appointment._id}: ${error}`);
        }
      }

    } catch (error) {
      result.errors.push(`Database error: ${error}`);
    } finally {
      this.isJobRunning = false;
    }

    console.log('Daily reminder job completed:', result);
    return result;
  }

  async sendNextDayReminders(): Promise<ReminderJobResult> {
    if (this.isJobRunning) {
      console.log('Reminder job is already running. Skipping...');
      return { totalChecked: 0, emailRemindersSent: 0, smsRemindersSent: 0, errors: ['Job already running'] };
    }

    this.isJobRunning = true;
    const result: ReminderJobResult = {
      totalChecked: 0,
      emailRemindersSent: 0,
      smsRemindersSent: 0,
      errors: []
    };

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        PatientAppointmentDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        AppointmentStatus: 'scheduled'
      });

      result.totalChecked = appointments.length;

      console.log(`Found ${appointments.length} appointments for day after tomorrow`);

      for (const appointment of appointments) {
        try {
          const doctor = await Doctor.findOne({ doctorId: appointment.DocID });
          if (!doctor) {
            result.errors.push(`Doctor not found for appointment ${appointment._id}`);
            continue;
          }

          const patientName = this.extractPatientName(appointment.PatientEmail);
          
          const emailSent = await emailService.sendAppointmentReminder(
            appointment.PatientEmail,
            patientName,
            `${doctor.firstName} ${doctor.lastName}`,
            appointment.PatientAppointmentDate,
            doctor.specialization,
            doctor.consultationFee
          );

          if (emailSent) {
            result.emailRemindersSent++;
          }

        } catch (error) {
          result.errors.push(`Error processing appointment ${appointment._id}: ${error}`);
        }
      }

    } catch (error) {
      result.errors.push(`Database error: ${error}`);
    } finally {
      this.isJobRunning = false;
    }

    console.log('Next-day reminder job completed:', result);
    return result;
  }

  async sendImmediateReminder(appointmentId: string): Promise<boolean> {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.AppointmentStatus !== 'scheduled') {
        return false;
      }

      const doctor = await Doctor.findOne({ doctorId: appointment.DocID });
      if (!doctor) {
        return false;
      }

      const patientName = this.extractPatientName(appointment.PatientEmail);
      
      const emailSent = await emailService.sendAppointmentReminder(
        appointment.PatientEmail,
        patientName,
        `${doctor.firstName} ${doctor.lastName}`,
        appointment.PatientAppointmentDate,
        doctor.specialization,
        doctor.consultationFee
      );

      const smsSent = await smsService.sendAppointmentReminder(
        appointment.PatientAddress,
        patientName,
        `${doctor.firstName} ${doctor.lastName}`,
        appointment.PatientAppointmentDate,
        doctor.consultationFee
      );

      return emailSent || smsSent;

    } catch (error) {
      console.error('Error sending immediate reminder:', error);
      return false;
    }
  }

  private extractPatientName(email: string): string {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  getJobStatus(): { isRunning: boolean } {
    return { isRunning: this.isJobRunning };
  }
}

export default new ReminderSchedulerService();