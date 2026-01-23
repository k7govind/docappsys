import Appointment from "../models/appointment.model.js";
console.log(await Appointment.collection.name);
//console.log(await Appointment.db.docapp);
export const createAppointmentService = async (data) => {
    return await Appointment.create(data);
};
export const getAllAppointmentsService = async () => {
    return await Appointment.find();
};
export const getAppointmentByIdService = async (id) => {
    return await Appointment.findById(id);
};
export const updateAppointmentService = async (id, data) => {
    return await Appointment.findByIdAndUpdate(id, data, { new: true });
};
export const cancelAppointmentService = async (id) => {
    return await Appointment.findByIdAndUpdate(id, { status: "cancelled" }, { new: true });
};
export const deleteAppointmentService = async (id) => {
    return await Appointment.findByIdAndDelete(id);
};
