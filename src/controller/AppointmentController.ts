import { Request, Response } from "express";
import { sanitizeInput } from "../util/sanitizeFields.js";
import {
  createAppointmentService,
  getAllAppointmentsService,
  getAppointmentByIdService,
  deleteAppointmentService
} from "../services/appointment.service.js";
import { IAppointment } from "../models/appointment.model.js";

export const createAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const formData = req.body;

    const payload: Partial<IAppointment> = {
      DocID: sanitizeInput(formData.DocID),
      PatientID: sanitizeInput(formData.PatientID),
      PatientEmail: sanitizeInput(formData.PatientEmail),
      PatientAddress: sanitizeInput(formData.PatientAddress),
      PatientAppointmentDate: new Date(formData.PatientAppointmentDate),
    };

    const result = await createAppointmentService(payload);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAppointments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const appointments = await getAllAppointmentsService();
    console.log(appointments);
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointments",
    });
  }
};

export const getAppointmentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await getAppointmentByIdService(id as string);
    
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointment",
    });
  }
};

export const deleteAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedAppointment = await deleteAppointmentService(id as string);
    
    if (!deletedAppointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      data: deletedAppointment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete appointment",
    });
  }
};
