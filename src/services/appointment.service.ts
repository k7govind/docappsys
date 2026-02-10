import Appointment, { IAppointment } from "../models/appointment.model.js";
import logger from "../config/logger.js";
//console.log(await Appointment.db.docapp);

export const createAppointmentService = async (
  data: Partial<IAppointment>
): Promise<IAppointment> => {
  logger.debug('Creating appointment in service', { 
    DocID: data.DocID,
    PatientEmail: data.PatientEmail ? '***@***.com' : undefined,
    PatientAppointmentDate: data.PatientAppointmentDate
  });
  
  const appointment = await Appointment.create(data);
  logger.info('Appointment created in database', { 
    appointmentId: appointment._id,
    DocID: appointment.DocID,
    appointmentDate: appointment.PatientAppointmentDate
  });
  
  return appointment;
};

export const getAllAppointmentsService = async (): Promise<IAppointment[]> => {
  logger.debug('Fetching all appointments from database');
  const appointments = await Appointment.find();
  logger.debug('Appointments fetched from database', { count: appointments.length });
  return appointments;
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
