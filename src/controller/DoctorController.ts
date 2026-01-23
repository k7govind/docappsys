import { Request, Response } from "express";
import { sanitizeInput } from "../util/sanitizeFields.js";
import {
  createDoctorService,
  getAllDoctorsService,
  getDoctorByIdService,
  getDoctorByDoctorIdService,
  updateDoctorService,
  updateDoctorByDoctorIdService,
  deleteDoctorService,
  deleteDoctorByDoctorIdService,
  hardDeleteDoctorService,
  hardDeleteDoctorByDoctorIdService,
  getDoctorsBySpecializationService,
  getDoctorsByDepartmentService,
  searchDoctorsByNameService,
  getAvailableDoctorsService
} from "../services/doctor.service.js";
import { IDoctor } from "../models/doctor.model.js";

// Create a new doctor
export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
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

    const result = await createDoctorService(payload as any);
    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create doctor"
    });
  }
};

// Get all doctors with optional filters
export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      isActive,
      specialization,
      department,
      page = "1",
      limit = "10"
    } = req.query;

    const filters = {
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      specialization: specialization as string,
      department: department as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await getAllDoctorsService(filters);
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctors"
    });
  }
};

// Get doctor by MongoDB ID
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doctor = await getDoctorByIdService(id as string);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctor"
    });
  }
};

// Get doctor by doctorId
export const getDoctorByDoctorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const doctor = await getDoctorByDoctorIdService(doctorId as string);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctor"
    });
  }
};

// Update doctor by MongoDB ID
export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Sanitize and prepare update data
    const updateData: Partial<IDoctor> = {};
    
    if (formData.firstName !== undefined) updateData.firstName = sanitizeInput(formData.firstName);
    if (formData.lastName !== undefined) updateData.lastName = sanitizeInput(formData.lastName);
    if (formData.email !== undefined) updateData.email = sanitizeInput(formData.email);
    if (formData.phone !== undefined) updateData.phone = sanitizeInput(formData.phone);
    if (formData.specialization !== undefined) updateData.specialization = sanitizeInput(formData.specialization);
    if (formData.department !== undefined) updateData.department = sanitizeInput(formData.department);
    if (formData.experience !== undefined) updateData.experience = Number(formData.experience);
    if (formData.qualification !== undefined) updateData.qualification = sanitizeInput(formData.qualification);
    if (formData.consultationFee !== undefined) updateData.consultationFee = Number(formData.consultationFee);
    if (formData.availableDays !== undefined) updateData.availableDays = formData.availableDays;
    if (formData.availableTime !== undefined) {
      updateData.availableTime = {
        start: sanitizeInput(formData.availableTime.start),
        end: sanitizeInput(formData.availableTime.end)
      };
    }
    if (formData.isActive !== undefined) updateData.isActive = formData.isActive;

    const result = await updateDoctorService(id as string, updateData);

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update doctor"
    });
  }
};

// Update doctor by doctorId
export const updateDoctorByDoctorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const formData = req.body;

    // Sanitize and prepare update data
    const updateData: Partial<IDoctor> = {};
    
    if (formData.firstName !== undefined) updateData.firstName = sanitizeInput(formData.firstName);
    if (formData.lastName !== undefined) updateData.lastName = sanitizeInput(formData.lastName);
    if (formData.email !== undefined) updateData.email = sanitizeInput(formData.email);
    if (formData.phone !== undefined) updateData.phone = sanitizeInput(formData.phone);
    if (formData.specialization !== undefined) updateData.specialization = sanitizeInput(formData.specialization);
    if (formData.department !== undefined) updateData.department = sanitizeInput(formData.department);
    if (formData.experience !== undefined) updateData.experience = Number(formData.experience);
    if (formData.qualification !== undefined) updateData.qualification = sanitizeInput(formData.qualification);
    if (formData.consultationFee !== undefined) updateData.consultationFee = Number(formData.consultationFee);
    if (formData.availableDays !== undefined) updateData.availableDays = formData.availableDays;
    if (formData.availableTime !== undefined) {
      updateData.availableTime = {
        start: sanitizeInput(formData.availableTime.start),
        end: sanitizeInput(formData.availableTime.end)
      };
    }
    if (formData.isActive !== undefined) updateData.isActive = formData.isActive;

    const result = await updateDoctorByDoctorIdService(doctorId as string, updateData);

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update doctor"
    });
  }
};

// Soft delete doctor by MongoDB ID
export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteDoctorService(id as string);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate doctor"
    });
  }
};

// Soft delete doctor by doctorId
export const deleteDoctorByDoctorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const result = await deleteDoctorByDoctorIdService(doctorId as string);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate doctor"
    });
  }
};

// Hard delete doctor by MongoDB ID
export const hardDeleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await hardDeleteDoctorService(id as string);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete doctor"
    });
  }
};

// Hard delete doctor by doctorId
export const hardDeleteDoctorByDoctorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const result = await hardDeleteDoctorByDoctorIdService(doctorId as string);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete doctor"
    });
  }
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialization } = req.params;
    const doctors = await getDoctorsBySpecializationService(specialization as string);

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
      count: doctors.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctors"
    });
  }
};

// Get doctors by department
export const getDoctorsByDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.params;
    const doctors = await getDoctorsByDepartmentService(department as string);

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
      count: doctors.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctors"
    });
  }
};

// Search doctors by name
export const searchDoctorsByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { searchTerm } = req.params;
    const doctors = await searchDoctorsByNameService(searchTerm as string);

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
      count: doctors.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctors"
    });
  }
};

// Get available doctors for specific day and time
export const getAvailableDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { day, time } = req.query;
    
    if (!day || !time) {
      res.status(400).json({
        success: false,
        message: "Day and time parameters are required"
      });
      return;
    }

    const doctors = await getAvailableDoctorsService(
      day as string,
      time as string
    );

    res.status(200).json({
      success: true,
      message: "Available doctors retrieved successfully",
      data: doctors,
      count: doctors.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve available doctors"
    });
  }
};