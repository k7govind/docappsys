import { sanitizeInput } from "../util/sanitizeFields.js";
import logger from "../config/logger.js";
import { createDoctorService, getAllDoctorsService, getDoctorByIdService, getDoctorByDoctorIdService, updateDoctorService, updateDoctorByDoctorIdService, deleteDoctorService, deleteDoctorByDoctorIdService, hardDeleteDoctorService, hardDeleteDoctorByDoctorIdService, getDoctorsBySpecializationService, getDoctorsByDepartmentService, searchDoctorsByNameService, getAvailableDoctorsService } from "../services/doctor.service.js";
// Create a new doctor
export const createDoctor = async (req, res) => {
    try {
        logger.info('Create doctor request received', {
            body: { ...req.body, email: req.body.email ? '***@***.com' : undefined },
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        const formData = req.body;
        // Sanitize input fields
        const payload = {
            firstName: sanitizeInput(formData.firstName),
            lastName: sanitizeInput(formData.lastName),
            email: sanitizeInput(formData.email),
            phone: sanitizeInput(formData.phone),
            specialization: sanitizeInput(formData.specialization),
            department: sanitizeInput(formData.department),
            experience: Number(formData.experience),
            qualification: sanitizeInput(formData.qualification),
            consultationFee: Number(formData.consultationFee),
            availableDays: formData.availableDays,
            availableTime: {
                start: sanitizeInput(formData.availableTime.start),
                end: sanitizeInput(formData.availableTime.end)
            }
        };
        const result = await createDoctorService(payload);
        logger.info('Doctor created successfully', { doctorId: result.doctorId, doctorName: `${result.firstName} ${result.lastName}` });
        res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            data: result
        });
    }
    catch (error) {
        logger.error('Failed to create doctor', {
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
// Get all doctors with optional filters
export const getAllDoctors = async (req, res) => {
    try {
        logger.info('Get all doctors request received', { query: req.query });
        const { isActive, specialization, department, page = "1", limit = "10" } = req.query;
        const filters = {
            isActive: isActive !== undefined ? isActive === "true" : undefined,
            specialization: specialization,
            department: department,
            page: parseInt(page),
            limit: parseInt(limit)
        };
        const result = await getAllDoctorsService(filters);
        logger.info('Doctors retrieved successfully', {
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
        logger.error('Failed to retrieve doctors', {
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
// Get doctor by MongoDB ID
export const getDoctorById = async (req, res) => {
    try {
        logger.info('Get doctor by ID request received', { id: req.params.id });
        const { id } = req.params;
        const doctor = await getDoctorByIdService(id);
        if (!doctor) {
            logger.warn('Doctor not found', { id: req.params.id });
            res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
            return;
        }
        logger.info('Doctor retrieved successfully', { id: doctor._id, doctorId: doctor.doctorId });
        res.status(200).json({
            success: true,
            message: "Doctor retrieved successfully",
            data: doctor
        });
    }
    catch (error) {
        logger.error('Failed to retrieve doctor', {
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
// Get doctor by doctorId
export const getDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await getDoctorByDoctorIdService(doctorId);
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
// Update doctor by MongoDB ID
export const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const formData = req.body;
        // Sanitize and prepare update data
        const updateData = {};
        if (formData.firstName !== undefined)
            updateData.firstName = sanitizeInput(formData.firstName);
        if (formData.lastName !== undefined)
            updateData.lastName = sanitizeInput(formData.lastName);
        if (formData.email !== undefined)
            updateData.email = sanitizeInput(formData.email);
        if (formData.phone !== undefined)
            updateData.phone = sanitizeInput(formData.phone);
        if (formData.specialization !== undefined)
            updateData.specialization = sanitizeInput(formData.specialization);
        if (formData.department !== undefined)
            updateData.department = sanitizeInput(formData.department);
        if (formData.experience !== undefined)
            updateData.experience = Number(formData.experience);
        if (formData.qualification !== undefined)
            updateData.qualification = sanitizeInput(formData.qualification);
        if (formData.consultationFee !== undefined)
            updateData.consultationFee = Number(formData.consultationFee);
        if (formData.availableDays !== undefined)
            updateData.availableDays = formData.availableDays;
        if (formData.availableTime !== undefined) {
            updateData.availableTime = {
                start: sanitizeInput(formData.availableTime.start),
                end: sanitizeInput(formData.availableTime.end)
            };
        }
        if (formData.isActive !== undefined)
            updateData.isActive = formData.isActive;
        const result = await updateDoctorService(id, updateData);
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
// Update doctor by doctorId
export const updateDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const formData = req.body;
        // Sanitize and prepare update data
        const updateData = {};
        if (formData.firstName !== undefined)
            updateData.firstName = sanitizeInput(formData.firstName);
        if (formData.lastName !== undefined)
            updateData.lastName = sanitizeInput(formData.lastName);
        if (formData.email !== undefined)
            updateData.email = sanitizeInput(formData.email);
        if (formData.phone !== undefined)
            updateData.phone = sanitizeInput(formData.phone);
        if (formData.specialization !== undefined)
            updateData.specialization = sanitizeInput(formData.specialization);
        if (formData.department !== undefined)
            updateData.department = sanitizeInput(formData.department);
        if (formData.experience !== undefined)
            updateData.experience = Number(formData.experience);
        if (formData.qualification !== undefined)
            updateData.qualification = sanitizeInput(formData.qualification);
        if (formData.consultationFee !== undefined)
            updateData.consultationFee = Number(formData.consultationFee);
        if (formData.availableDays !== undefined)
            updateData.availableDays = formData.availableDays;
        if (formData.availableTime !== undefined) {
            updateData.availableTime = {
                start: sanitizeInput(formData.availableTime.start),
                end: sanitizeInput(formData.availableTime.end)
            };
        }
        if (formData.isActive !== undefined)
            updateData.isActive = formData.isActive;
        const result = await updateDoctorByDoctorIdService(doctorId, updateData);
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
// Soft delete doctor by MongoDB ID
export const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteDoctorService(id);
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
// Soft delete doctor by doctorId
export const deleteDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const result = await deleteDoctorByDoctorIdService(doctorId);
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
// Hard delete doctor by MongoDB ID
export const hardDeleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await hardDeleteDoctorService(id);
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
// Hard delete doctor by doctorId
export const hardDeleteDoctorByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const result = await hardDeleteDoctorByDoctorIdService(doctorId);
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
// Get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
    try {
        const { specialization } = req.params;
        const doctors = await getDoctorsBySpecializationService(specialization);
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
// Get doctors by department
export const getDoctorsByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const doctors = await getDoctorsByDepartmentService(department);
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
// Search doctors by name
export const searchDoctorsByName = async (req, res) => {
    try {
        const { searchTerm } = req.params;
        const doctors = await searchDoctorsByNameService(searchTerm);
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
// Get available doctors for specific day and time
export const getAvailableDoctors = async (req, res) => {
    try {
        const { day, time } = req.query;
        if (!day || !time) {
            res.status(400).json({
                success: false,
                message: "Day and time parameters are required"
            });
            return;
        }
        const doctors = await getAvailableDoctorsService(day, time);
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
