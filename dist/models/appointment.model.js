import mongoose, { Schema } from "mongoose";
const appointmentSchema = new Schema({
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
});
const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
