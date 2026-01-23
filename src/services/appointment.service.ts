import Appointment, { IAppointment } from "../models/appointment.model.js";

console.log(await Appointment.collection.name);
//console.log(await Appointment.db.docapp);

export const createAppointmentService = async (
  data: Partial<IAppointment>
): Promise<IAppointment> => {
  return await Appointment.create(data);
};

export const getAllAppointmentsService = async (): Promise<IAppointment[]> => {
  return await Appointment.find();
};

export const getAppointmentByIdService = async (
  id: string
): Promise<IAppointment | null> => {
  return await Appointment.findById(id);
};

export const updateAppointmentService = async (
  id: string,
  data: Partial<IAppointment>
): Promise<IAppointment | null> => {
  return await Appointment.findByIdAndUpdate(id, data, { new: true });
};

export const cancelAppointmentService = async (
  id: string
): Promise<IAppointment | null> => {
  return await Appointment.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true }
  );
};

export const deleteAppointmentService = async (
  id: string
): Promise<IAppointment | null> => {
  return await Appointment.findByIdAndDelete(id);
};
