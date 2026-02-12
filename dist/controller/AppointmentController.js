import { sanitizeInput } from "../util/sanitizeFields.js";
import logger from "../config/logger.js";
import { createAppointmentService, getAllAppointmentsService, getAppointmentByIdService, deleteAppointmentService } from "../services/appointment.service.js";
export const createAppointment = async (req, res) => {
    try {
        logger.info('Create appointment request received', {
            body: {
                ...req.body,
                PatientEmail: req.body.PatientEmail ? '***@***.com' : undefined,
                PatientID: req.body.PatientID ? '***' : undefined
            },
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        const formData = req.body;
        const payload = {
            DocID: sanitizeInput(formData.DocID),
            PatientID: sanitizeInput(formData.PatientID),
            PatientEmail: sanitizeInput(formData.PatientEmail),
            PatientAddress: sanitizeInput(formData.PatientAddress),
            PatientAppointmentDate: new Date(formData.PatientAppointmentDate),
        };
        const result = await createAppointmentService(payload);
        logger.info('Appointment created successfully', {
            appointmentId: result._id,
            DocID: result.DocID,
            appointmentDate: result.PatientAppointmentDate
        });
        res.status(201).json(result);
    }
    catch (error) {
        logger.error('Failed to create appointment', {
            error: error.message,
            stack: error.stack,
            body: {
                ...req.body,
                PatientEmail: req.body.PatientEmail ? '***@***.com' : undefined,
                PatientID: req.body.PatientID ? '***' : undefined
            }
        });
        res.status(500).json({ message: error.message });
    }
};
export const getAllAppointments = async (req, res) => {
    try {
        logger.info('Get all appointments request received');
        const appointments = await getAllAppointmentsService();
        logger.info('Appointments retrieved successfully', { count: appointments.length });
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    }
    catch (error) {
        logger.error('Failed to fetch appointments', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch appointments",
        });
    }
};
export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await getAppointmentByIdService(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch appointment",
        });
    }
};
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAppointment = await deleteAppointmentService(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete appointment",
        });
    }
};
