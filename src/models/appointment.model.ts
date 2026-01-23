import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  DocID: string;
  PatientID: string;
  PatientEmail: string;
  PatientAddress: string;
  PatientAppointmentDate: Date;
  AppointmentStatus: "scheduled" | "completed" | "cancelled";
}

const appointmentSchema = new Schema<IAppointment>(
  {
    DocID: { type: String, required: true, unique: true },
    PatientID: { type: String, required: true },
    PatientEmail: { type: String, required: true },
    PatientAddress: { type: String, required: true },
    PatientAppointmentDate: { type: Date, required: true },
    AppointmentStatus: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled"
    }
  }
);

const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

export default Appointment;
