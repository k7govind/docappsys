"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableDoctorsService = exports.searchDoctorsByNameService = exports.getDoctorsByDepartmentService = exports.getDoctorsBySpecializationService = exports.hardDeleteDoctorByDoctorIdService = exports.hardDeleteDoctorService = exports.deleteDoctorByDoctorIdService = exports.deleteDoctorService = exports.updateDoctorByDoctorIdService = exports.updateDoctorService = exports.getDoctorByDoctorIdService = exports.getDoctorByIdService = exports.getAllDoctorsService = exports.createDoctorService = void 0;
const doctor_model_js_1 = __importDefault(require("../models/doctor.model.js"));
const logger_js_1 = __importDefault(require("../config/logger.js"));
// Generate unique doctor ID
const generateDoctorId = () => {
    const prefix = "DOC";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
};
// Create a new doctor
const createDoctorService = async (data) => {
    logger_js_1.default.debug('Creating new doctor in service', {
        email: data.email ? '***@***.com' : undefined,
        firstName: data.firstName,
        lastName: data.lastName,
        specialization: data.specialization
    });
    // Check if doctor with email already exists
    const existingDoctor = await doctor_model_js_1.default.findOne({ email: data.email });
    if (existingDoctor) {
        logger_js_1.default.warn('Doctor with email already exists', { email: data.email ? '***@***.com' : undefined });
        throw new Error("Doctor with this email already exists");
    }
    // Generate unique doctor ID
    const doctorId = generateDoctorId();
    const doctorData = {
        ...data,
        doctorId,
        isActive: true
    };
    const newDoctor = await doctor_model_js_1.default.create(doctorData);
    logger_js_1.default.info('Doctor created in database', {
        doctorId: newDoctor.doctorId,
        doctorName: `${newDoctor.firstName} ${newDoctor.lastName}`
    });
    return newDoctor;
};
exports.createDoctorService = createDoctorService;
// Get all doctors with optional filters
const getAllDoctorsService = async (filters = {}) => {
    const { isActive, specialization, department, page = 1, limit = 10 } = filters;
    // Build query
    const query = {};
    if (isActive !== undefined)
        query.isActive = isActive;
    if (specialization)
        query.specialization = new RegExp(specialization, 'i');
    if (department)
        query.department = new RegExp(department, 'i');
    const skip = (page - 1) * limit;
    logger_js_1.default.debug('Fetching doctors from database', { query, skip, limit });
    const [doctors, total] = await Promise.all([
        doctor_model_js_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        doctor_model_js_1.default.countDocuments(query)
    ]);
    logger_js_1.default.debug('Doctors fetched from database', { count: doctors.length, total });
    return {
        doctors,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};
exports.getAllDoctorsService = getAllDoctorsService;
// Get doctor by ID
const getDoctorByIdService = async (id) => {
    return await doctor_model_js_1.default.findById(id);
};
exports.getDoctorByIdService = getDoctorByIdService;
// Get doctor by doctorId
const getDoctorByDoctorIdService = async (doctorId) => {
    return await doctor_model_js_1.default.findOne({ doctorId });
};
exports.getDoctorByDoctorIdService = getDoctorByDoctorIdService;
// Update doctor by ID
const updateDoctorService = async (id, data) => {
    // Check if email is being updated and if it's already taken
    if (data.email) {
        const existingDoctor = await doctor_model_js_1.default.findOne({
            email: data.email,
            _id: { $ne: id }
        });
        if (existingDoctor) {
            throw new Error("Doctor with this email already exists");
        }
    }
    return await doctor_model_js_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};
exports.updateDoctorService = updateDoctorService;
// Update doctor by doctorId
const updateDoctorByDoctorIdService = async (doctorId, data) => {
    // Check if email is being updated and if it's already taken
    if (data.email) {
        const existingDoctor = await doctor_model_js_1.default.findOne({
            email: data.email,
            doctorId: { $ne: doctorId }
        });
        if (existingDoctor) {
            throw new Error("Doctor with this email already exists");
        }
    }
    return await doctor_model_js_1.default.findOneAndUpdate({ doctorId }, data, { new: true, runValidators: true });
};
exports.updateDoctorByDoctorIdService = updateDoctorByDoctorIdService;
// Delete doctor by ID (soft delete - set isActive to false)
const deleteDoctorService = async (id) => {
    return await doctor_model_js_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
exports.deleteDoctorService = deleteDoctorService;
// Delete doctor by doctorId (soft delete)
const deleteDoctorByDoctorIdService = async (doctorId) => {
    return await doctor_model_js_1.default.findOneAndUpdate({ doctorId }, { isActive: false }, { new: true });
};
exports.deleteDoctorByDoctorIdService = deleteDoctorByDoctorIdService;
// Hard delete doctor by ID (permanently remove from database)
const hardDeleteDoctorService = async (id) => {
    return await doctor_model_js_1.default.findByIdAndDelete(id);
};
exports.hardDeleteDoctorService = hardDeleteDoctorService;
// Hard delete doctor by doctorId
const hardDeleteDoctorByDoctorIdService = async (doctorId) => {
    return await doctor_model_js_1.default.findOneAndDelete({ doctorId });
};
exports.hardDeleteDoctorByDoctorIdService = hardDeleteDoctorByDoctorIdService;
// Get doctors by specialization
const getDoctorsBySpecializationService = async (specialization) => {
    return await doctor_model_js_1.default.find({
        specialization: new RegExp(specialization, 'i'),
        isActive: true
    });
};
exports.getDoctorsBySpecializationService = getDoctorsBySpecializationService;
// Get doctors by department
const getDoctorsByDepartmentService = async (department) => {
    return await doctor_model_js_1.default.find({
        department: new RegExp(department, 'i'),
        isActive: true
    });
};
exports.getDoctorsByDepartmentService = getDoctorsByDepartmentService;
// Search doctors by name
const searchDoctorsByNameService = async (searchTerm) => {
    const regex = new RegExp(searchTerm, 'i');
    return await doctor_model_js_1.default.find({
        $or: [
            { firstName: regex },
            { lastName: regex },
            { fullName: regex }
        ],
        isActive: true
    });
};
exports.searchDoctorsByNameService = searchDoctorsByNameService;
// Get available doctors for a specific day and time
const getAvailableDoctorsService = async (day, time) => {
    return await doctor_model_js_1.default.find({
        availableDays: { $in: [day] },
        "availableTime.start": { $lte: time },
        "availableTime.end": { $gte: time },
        isActive: true
    });
};
exports.getAvailableDoctorsService = getAvailableDoctorsService;
