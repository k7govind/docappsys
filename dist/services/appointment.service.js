"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointmentService = exports.cancelAppointmentService = exports.updateAppointmentService = exports.getAppointmentByIdService = exports.getAllAppointmentsService = exports.createAppointmentService = void 0;
const appointment_model_js_1 = __importDefault(require("../models/appointment.model.js"));
const logger_js_1 = __importDefault(require("../config/logger.js"));
//console.log(await Appointment.db.docapp);
const createAppointmentService = async (data) => {
    logger_js_1.default.debug('Creating appointment in service', {
        DocID: data.DocID,
        PatientEmail: data.PatientEmail ? '***@***.com' : undefined,
        PatientAppointmentDate: data.PatientAppointmentDate
    });
    const appointment = await appointment_model_js_1.default.create(data);
    logger_js_1.default.info('Appointment created in database', {
        appointmentId: appointment._id,
        DocID: appointment.DocID,
        appointmentDate: appointment.PatientAppointmentDate
    });
    return appointment;
};
exports.createAppointmentService = createAppointmentService;
const getAllAppointmentsService = async () => {
    logger_js_1.default.debug('Fetching all appointments from database');
    const appointments = await appointment_model_js_1.default.find();
    logger_js_1.default.debug('Appointments fetched from database', { count: appointments.length });
    return appointments;
};
exports.getAllAppointmentsService = getAllAppointmentsService;
const getAppointmentByIdService = async (id) => {
    return await appointment_model_js_1.default.findById(id);
};
exports.getAppointmentByIdService = getAppointmentByIdService;
const updateAppointmentService = async (id, data) => {
    return await appointment_model_js_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateAppointmentService = updateAppointmentService;
const cancelAppointmentService = async (id) => {
    return await appointment_model_js_1.default.findByIdAndUpdate(id, { status: "cancelled" }, { new: true });
};
exports.cancelAppointmentService = cancelAppointmentService;
const deleteAppointmentService = async (id) => {
    return await appointment_model_js_1.default.findByIdAndDelete(id);
};
exports.deleteAppointmentService = deleteAppointmentService;
