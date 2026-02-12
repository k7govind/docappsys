import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  DocID: string;
  PatientID: string;
  PatientEmail: string;
  PatientAddress: string;
  PatientAppointmentDate: Date;
  AppointmentStatus: "scheduled" | "completed" | "cancelled";
  emailReminderSent?: boolean;
  smsReminderSent?: boolean;
  reminderPreferences?: {
    email: boolean;
    sms: boolean;
    reminderTime: number;
  };
  lastReminderSent?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    DocID: { type: String, required: true },
    PatientID: { type: String, required: true },
    PatientEmail: { type: String, required: true },
    PatientAddress: { type: String, required: true },
    PatientAppointmentDate: { type: Date, required: true },
    AppointmentStatus: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled"
    },
    emailReminderSent: { type: Boolean, default: false },
    smsReminderSent: { type: Boolean, default: false },
    reminderPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      reminderTime: { 
        type: Number, 
        default: 24,
        min: 1,
        max: 168
      }
    },
    lastReminderSent: { type: Date, default: null }
  },
  { timestamps: true }
);

appointmentSchema.index({ DocID: 1 });
appointmentSchema.index({ PatientID: 1 });
appointmentSchema.index({ PatientAppointmentDate: 1 });
appointmentSchema.index({ AppointmentStatus: 1 });
appointmentSchema.index({ emailReminderSent: 1 });
appointmentSchema.index({ smsReminderSent: 1 });
appointmentSchema.index({ lastReminderSent: 1 });

const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

export default Appointment;
