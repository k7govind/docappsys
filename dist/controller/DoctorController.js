"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableDoctors = exports.searchDoctorsByName = exports.getDoctorsByDepartment = exports.getDoctorsBySpecialization = exports.hardDeleteDoctorByDoctorId = exports.hardDeleteDoctor = exports.deleteDoctorByDoctorId = exports.deleteDoctor = exports.updateDoctorByDoctorId = exports.updateDoctor = exports.getDoctorByDoctorId = exports.getDoctorById = exports.getAllDoctors = exports.createDoctor = void 0;
const sanitizeFields_js_1 = require("../util/sanitizeFields.js");
const logger_js_1 = __importDefault(require("../config/logger.js"));
const doctor_service_js_1 = require("../services/doctor.service.js");
// Create a new doctor
const createDoctor = async (req, res) => {
    try {
        logger_js_1.default.info('Create doctor request received', {
            body: { ...req.body, email: req.body.email ? '***@***.com' : undefined },
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        const formData = req.body;
        // Sanitize input fields
        const payload = {
            firstName: (0, sanitizeFields_js_1.sanitizeInput)(formData.firstName),
            lastName: (0, sanitizeFields_js_1.sanitizeInput)(formData.lastName),
            email: (0, sanitizeFields_js_1.sanitizeInput)(formData.email),
            phone: (0, sanitizeFields_js_1.sanitizeInput)(formData.phone),
            specialization: (0, sanitizeFields_js_1.sanitizeInput)(formData.specialization),
            department: (0, sanitizeFields_js_1.sanitizeInput)(formData.department),
            experience: Number(formData.experience),
            qualification: (0, sanitizeFields_js_1.sanitizeInput)(formData.qualification),
            consultationFee: Number(formData.consultationFee),
            availableDays: formData.availableDays,
            availableTime: {
                start: (0, sanitizeFields_js_1.sanitizeInput)(formData.availableTime.start),
                end: (0, sanitizeFields_js_1.sanitizeInput)(formData.availableTime.end)
            }
        };
        const result = await (0, doctor_service_js_1.createDoctorService)(payload);
        logger_js_1.default.info('Doctor created successfully', { doctorId: result.doctorId, doctorName: `${result.firstName} ${result.lastName}` });
        res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            data: result
        });
    }
    catch (error) {
        logger_js_1.default.error('Failed to create doctor', {
            error: error.message,
            stack: error.stack,
            body: { ...req.body, email: req.body.email ? '***@***.com' : undefined }
        });
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create doctor"
        });
    }
};
exports.createDoctor = createDoctor;
// Get all doctors with optional filters
const getAllDoctors = async (req, res) => {
    try {
        logger_js_1.default.info('Get all doctors request received', { query: req.query });
        const { isActive, specialization, department, page = "1", limit = "10" } = req.query;
        const filters = {
            isActive: isActive !== undefined ? isActive === "true" : undefined,
            specialization: specialization,
            department: department,
            page: parseInt(page),
            limit: parseInt(limit)
        };
        const result = await (0, doctor_service_js_1.getAllDoctorsService)(filters);
        logger_js_1.default.info('Doctors retrieved successfully', {
            count: result.doctors.length,
            total: result.total,
            page: result.page,
            filters
        });
        res.status(200).json({
            success: true,
            message: "Doctors retrieved successfully",
            data: result.doctors,
            pagination: {
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                limit: filters.limit
            }
        });
    }
    catch (error) {
        logger_js_1.default.error('Failed to retrieve doctors', {
            error: error.message,
            stack: error.stack,
            query: req.query
        });
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve doctors"
        });
    }
};
exports.getAllDoctors = getAllDoctors;
// Get doctor by MongoDB ID
const getDoctorById = async (req, res) => {
    try {
        logger_js_1.default.info('Get doctor by ID request received', { id: req.params.id });
        const { id } = req.params;
        const doctor = await (0, doctor_service_js_1.getDoctorByIdService)(id);
        if (!doctor) {
            logger_js_1.default.warn('Doctor not found', { id: req.params.id });
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        logger_js_1.default.info('Doctor retrieved successfully', { id: doctor._id, doctorId: doctor.doctorId });
        res.status(200).json({
            success: true,
            message: "Doctor retrieved successfully",
            data: doctor
        });
    }
    catch (error) {
        logger_js_1.default.error('Failed to retrieve doctor', {
            error: error.message,
            stack: error.stack,
            id: req.params.id
        });
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve doctor"
        });
    }
};
exports.getDoctorById = getDoctorById;
// Get doctor by doctorId
const getDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await (0, doctor_service_js_1.getDoctorByDoctorIdService)(doctorId);
        if (!doctor) {
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Doctor retrieved successfully",
            data: doctor
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve doctor"
        });
    }
};
exports.getDoctorByDoctorId = getDoctorByDoctorId;
// Update doctor by MongoDB ID
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const formData = req.body;
        // Sanitize and prepare update data
        const updateData = {};
        if (formData.firstName !== undefined)
            updateData.firstName = (0, sanitizeFields_js_1.sanitizeInput)(formData.firstName);
        if (formData.lastName !== undefined)
            updateData.lastName = (0, sanitizeFields_js_1.sanitizeInput)(formData.lastName);
        if (formData.email !== undefined)
            updateData.email = (0, sanitizeFields_js_1.sanitizeInput)(formData.email);
        if (formData.phone !== undefined)
            updateData.phone = (0, sanitizeFields_js_1.sanitizeInput)(formData.phone);
        if (formData.specialization !== undefined)
            updateData.specialization = (0, sanitizeFields_js_1.sanitizeInput)(formData.specialization);
        if (formData.department !== undefined)
            updateData.department = (0, sanitizeFields_js_1.sanitizeInput)(formData.department);
        if (formData.experience !== undefined)
            updateData.experience = Number(formData.experience);
        if (formData.qualification !== undefined)
            updateData.qualification = (0, sanitizeFields_js_1.sanitizeInput)(formData.qualification);
        if (formData.consultationFee !== undefined)
            updateData.consultationFee = Number(formData.consultationFee);
        if (formData.availableDays !== undefined)
            updateData.availableDays = formData.availableDays;
        if (formData.availableTime !== undefined) {
            updateData.availableTime = {
                start: (0, sanitizeFields_js_1.sanitizeInput)(formData.availableTime.start),
                end: (0, sanitizeFields_js_1.sanitizeInput)(formData.availableTime.end)
            };
        }
        if (formData.isActive !== undefined)
            updateData.isActive = formData.isActive;
        const result = await (0, doctor_service_js_1.updateDoctorService)(id, updateData);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update doctor"
        });
    }
};
exports.updateDoctor = updateDoctor;
// Update doctor by doctorId
const updateDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const formData = req.body;
        // Sanitize and prepare update data
        const updateData = {};
        if (formData.firstName !== undefined)
            updateData.firstName = (0, sanitizeFields_js_1.sanitizeInput)(formData.firstName);
        if (formData.lastName !== undefined)
            updateData.lastName = (0, sanitizeFields_js_1.sanitizeInput)(formData.lastName);
        if (formData.email !== undefined)
            updateData.email = (0, sanitizeFields_js_1.sanitizeInput)(formData.email);
        if (formData.phone !== undefined)
            updateData.phone = (0, sanitizeFields_js_1.sanitizeInput)(formData.phone);
        if (formData.specialization !== undefined)
            updateData.specialization = (0, sanitizeFields_js_1.sanitizeInput)(formData.specialization);
        if (formData.department !== undefined)
            updateData.department = (0, sanitizeFields_js_1.sanitizeInput)(formData.department);
        if (formData.experience !== undefined)
            updateData.experience = Number(formData.experience);
        if (formData.qualification !== undefined)
            updateData.qualification = (0, sanitizeFields_js_1.sanitizeInput)(formData.qualification);
        if (formData.consultationFee !== undefined)
            updateData.consultationFee = Number(formData.consultationFee);
        if (formData.availableDays !== undefined)
            updateData.availableDays = formData.availableDays;
        if (formData.availableTime !== undefined) {
            updateData.availableTime = {
                start: (0, sanitizeFields_js_1.sanitizeInput)(formData.availableTime.start),
                end: (0, sanitizeFields_js_1.sanitizeInput)(formData.availableTime.end)
            };
        }
        if (formData.isActive !== undefined)
            updateData.isActive = formData.isActive;
        const result = await (0, doctor_service_js_1.updateDoctorByDoctorIdService)(doctorId, updateData);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update doctor"
        });
    }
};
exports.updateDoctorByDoctorId = updateDoctorByDoctorId;
// Soft delete doctor by MongoDB ID
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, doctor_service_js_1.deleteDoctorService)(id);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Doctor deactivated successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to deactivate doctor"
        });
    }
};
exports.deleteDoctor = deleteDoctor;
// Soft delete doctor by doctorId
const deleteDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const result = await (0, doctor_service_js_1.deleteDoctorByDoctorIdService)(doctorId);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Doctor deactivated successfully",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to deactivate doctor"
        });
    }
};
exports.deleteDoctorByDoctorId = deleteDoctorByDoctorId;
// Hard delete doctor by MongoDB ID
const hardDeleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, doctor_service_js_1.hardDeleteDoctorService)(id);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Doctor deleted permanently",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete doctor"
        });
    }
};
exports.hardDeleteDoctor = hardDeleteDoctor;
// Hard delete doctor by doctorId
const hardDeleteDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const result = await (0, doctor_service_js_1.hardDeleteDoctorByDoctorIdService)(doctorId);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Doctor deleted permanently",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete doctor"
        });
    }
};
exports.hardDeleteDoctorByDoctorId = hardDeleteDoctorByDoctorId;
// Get doctors by specialization
const getDoctorsBySpecialization = async (req, res) => {
    try {
        const { specialization } = req.params;
        const doctors = await (0, doctor_service_js_1.getDoctorsBySpecializationService)(specialization);
        res.status(200).json({
            success: true,
            message: "Doctors retrieved successfully",
            data: doctors,
            count: doctors.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve doctors"
        });
    }
};
exports.getDoctorsBySpecialization = getDoctorsBySpecialization;
// Get doctors by department
const getDoctorsByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const doctors = await (0, doctor_service_js_1.getDoctorsByDepartmentService)(department);
        res.status(200).json({
            success: true,
            message: "Doctors retrieved successfully",
            data: doctors,
            count: doctors.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve doctors"
        });
    }
};
exports.getDoctorsByDepartment = getDoctorsByDepartment;
// Search doctors by name
const searchDoctorsByName = async (req, res) => {
    try {
        const { searchTerm } = req.params;
        const doctors = await (0, doctor_service_js_1.searchDoctorsByNameService)(searchTerm);
        res.status(200).json({
            success: true,
            message: "Doctors retrieved successfully",
            data: doctors,
            count: doctors.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve doctors"
        });
    }
};
exports.searchDoctorsByName = searchDoctorsByName;
// Get available doctors for specific day and time
const getAvailableDoctors = async (req, res) => {
    try {
        const { day, time } = req.query;
        if (!day || !time) {
            res.status(400).json({
                success: false,
                message: "Day and time parameters are required"
            });
            return;
        }
        const doctors = await (0, doctor_service_js_1.getAvailableDoctorsService)(day, time);
        res.status(200).json({
            success: true,
            message: "Available doctors retrieved successfully",
            data: doctors,
            count: doctors.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve available doctors"
        });
    }
};
exports.getAvailableDoctors = getAvailableDoctors;
