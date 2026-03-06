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
  paymentStatus?: "pending" | "paid" | "refunded" | "failed" | "cancelled";
  paymentMethod?: "stripe" | "paypal" | "cash" | "insurance";
  paymentAmount?: number;
  paymentCurrency?: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paymentDate?: Date;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  paymentMetadata?: Record<string, any>;
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
    lastReminderSent: { type: Date, default: null },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "refunded", "failed", "cancelled"],
      default: "pending" 
    },
    paymentMethod: { 
      type: String, 
      enum: ["stripe", "paypal", "cash", "insurance"],
      default: null 
    },
    paymentAmount: { type: Number, default: null },
    paymentCurrency: { type: String, default: "USD" },
    transactionId: { type: String, default: null },
    stripePaymentIntentId: { type: String, default: null },
    paypalOrderId: { type: String, default: null },
    paypalCaptureId: { type: String, default: null },
    paymentDate: { type: Date, default: null },
    refundAmount: { type: Number, default: null },
    refundDate: { type: Date, default: null },
    refundReason: { type: String, default: null },
    paymentMetadata: { type: Schema.Types.Mixed, default: {} }
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
appointmentSchema.index({ paymentStatus: 1 });
appointmentSchema.index({ paymentMethod: 1 });
appointmentSchema.index({ transactionId: 1 });
appointmentSchema.index({ stripePaymentIntentId: 1 });
appointmentSchema.index({ paypalOrderId: 1 });
appointmentSchema.index({ paymentDate: 1 });

const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

export default Appointment;
