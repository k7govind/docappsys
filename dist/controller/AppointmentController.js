"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.getAppointmentById = exports.getAllAppointments = exports.createAppointment = void 0;
const sanitizeFields_js_1 = require("../util/sanitizeFields.js");
const logger_js_1 = __importDefault(require("../config/logger.js"));
const appointment_service_js_1 = require("../services/appointment.service.js");
const createAppointment = async (req, res) => {
    try {
        logger_js_1.default.info('Create appointment request received', {
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
            DocID: (0, sanitizeFields_js_1.sanitizeInput)(formData.DocID),
            PatientID: (0, sanitizeFields_js_1.sanitizeInput)(formData.PatientID),
            PatientEmail: (0, sanitizeFields_js_1.sanitizeInput)(formData.PatientEmail),
            PatientAddress: (0, sanitizeFields_js_1.sanitizeInput)(formData.PatientAddress),
            PatientAppointmentDate: new Date(formData.PatientAppointmentDate),
        };
        const result = await (0, appointment_service_js_1.createAppointmentService)(payload);
        logger_js_1.default.info('Appointment created successfully', {
            appointmentId: result._id,
            DocID: result.DocID,
            appointmentDate: result.PatientAppointmentDate
        });
        res.status(201).json(result);
    }
    catch (error) {
        logger_js_1.default.error('Failed to create appointment', {
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
exports.createAppointment = createAppointment;
const getAllAppointments = async (req, res) => {
    try {
        logger_js_1.default.info('Get all appointments request received');
        const appointments = await (0, appointment_service_js_1.getAllAppointmentsService)();
        logger_js_1.default.info('Appointments retrieved successfully', { count: appointments.length });
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    }
    catch (error) {
        logger_js_1.default.error('Failed to fetch appointments', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch appointments",
        });
    }
};
exports.getAllAppointments = getAllAppointments;
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await (0, appointment_service_js_1.getAppointmentByIdService)(id);
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
exports.getAppointmentById = getAppointmentById;
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAppointment = await (0, appointment_service_js_1.deleteAppointmentService)(id);
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
exports.deleteAppointment = deleteAppointment;
