import Doctor, { IDoctor } from "../models/doctor.model.js";

// Generate unique doctor ID
const generateDoctorId = (): string => {
  const prefix = "DOC";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Create a new doctor
export const createDoctorService = async (
  data: Omit<IDoctor, "_id" | "doctorId" | "createdAt" | "updatedAt" | "isActive">
): Promise<IDoctor> => {
  // Check if doctor with email already exists
  const existingDoctor = await Doctor.findOne({ email: data.email });
  if (existingDoctor) {
    throw new Error("Doctor with this email already exists");
  }

  // Generate unique doctor ID
  const doctorId = generateDoctorId();
  
  const doctorData = {
    ...data,
    doctorId,
    isActive: true
  };

  return await Doctor.create(doctorData);
};

// Get all doctors with optional filters
export const getAllDoctorsService = async (
  filters: {
    isActive?: boolean;
    specialization?: string;
    department?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  doctors: IDoctor[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const {
    isActive,
    specialization,
    department,
    page = 1,
    limit = 10
  } = filters;

  // Build query
  const query: any = {};
  if (isActive !== undefined) query.isActive = isActive;
  if (specialization) query.specialization = new RegExp(specialization, 'i');
  if (department) query.department = new RegExp(department, 'i');

  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    Doctor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Doctor.countDocuments(query)
  ]);

  return {
    doctors,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Get doctor by ID
export const getDoctorByIdService = async (
  id: string
): Promise<IDoctor | null> => {
  return await Doctor.findById(id);
};

// Get doctor by doctorId
export const getDoctorByDoctorIdService = async (
  doctorId: string
): Promise<IDoctor | null> => {
  return await Doctor.findOne({ doctorId });
};

// Update doctor by ID
export const updateDoctorService = async (
  id: string,
  data: Partial<Omit<IDoctor, "_id" | "doctorId" | "createdAt" | "updatedAt">>
): Promise<IDoctor | null> => {
  // Check if email is being updated and if it's already taken
  if (data.email) {
    const existingDoctor = await Doctor.findOne({ 
      email: data.email, 
      _id: { $ne: id } 
    });
    if (existingDoctor) {
      throw new Error("Doctor with this email already exists");
    }
  }

  return await Doctor.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
};

// Update doctor by doctorId
export const updateDoctorByDoctorIdService = async (
  doctorId: string,
  data: Partial<Omit<IDoctor, "_id" | "doctorId" | "createdAt" | "updatedAt">>
): Promise<IDoctor | null> => {
  // Check if email is being updated and if it's already taken
  if (data.email) {
    const existingDoctor = await Doctor.findOne({ 
      email: data.email, 
      doctorId: { $ne: doctorId } 
    });
    if (existingDoctor) {
      throw new Error("Doctor with this email already exists");
    }
  }

  return await Doctor.findOneAndUpdate(
    { doctorId },
    data,
    { new: true, runValidators: true }
  );
};

// Delete doctor by ID (soft delete - set isActive to false)
export const deleteDoctorService = async (id: string): Promise<IDoctor | null> => {
  return await Doctor.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};

// Delete doctor by doctorId (soft delete)
export const deleteDoctorByDoctorIdService = async (doctorId: string): Promise<IDoctor | null> => {
  return await Doctor.findOneAndUpdate(
    { doctorId },
    { isActive: false },
    { new: true }
  );
};

// Hard delete doctor by ID (permanently remove from database)
export const hardDeleteDoctorService = async (id: string): Promise<IDoctor | null> => {
  return await Doctor.findByIdAndDelete(id);
};

// Hard delete doctor by doctorId
export const hardDeleteDoctorByDoctorIdService = async (doctorId: string): Promise<IDoctor | null> => {
  return await Doctor.findOneAndDelete({ doctorId });
};

// Get doctors by specialization
export const getDoctorsBySpecializationService = async (
  specialization: string
): Promise<IDoctor[]> => {
  return await Doctor.find({ 
    specialization: new RegExp(specialization, 'i'),
    isActive: true 
  });
};

// Get doctors by department
export const getDoctorsByDepartmentService = async (
  department: string
): Promise<IDoctor[]> => {
  return await Doctor.find({ 
    department: new RegExp(department, 'i'),
    isActive: true 
  });
};

// Search doctors by name
export const searchDoctorsByNameService = async (
  searchTerm: string
): Promise<IDoctor[]> => {
  const regex = new RegExp(searchTerm, 'i');
  return await Doctor.find({
    $or: [
      { firstName: regex },
      { lastName: regex },
      { fullName: regex }
    ],
    isActive: true
  });
};

// Get available doctors for a specific day and time
export const getAvailableDoctorsService = async (
  day: string,
  time: string
): Promise<IDoctor[]> => {
  return await Doctor.find({
    availableDays: { $in: [day] },
    "availableTime.start": { $lte: time },
    "availableTime.end": { $gte: time },
    isActive: true
  });
};