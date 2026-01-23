import { Router } from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorByDoctorId,
  updateDoctor,
  updateDoctorByDoctorId,
  deleteDoctor,
  deleteDoctorByDoctorId,
  hardDeleteDoctor,
  hardDeleteDoctorByDoctorId,
  getDoctorsBySpecialization,
  getDoctorsByDepartment,
  searchDoctorsByName,
  getAvailableDoctors
} from "../controller/DoctorController.js";

const router: Router = Router();

// Basic CRUD operations
router.post("/", createDoctor);
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

// Operations using doctorId
router.get("/doctor-id/:doctorId", getDoctorByDoctorId);
router.put("/doctor-id/:doctorId", updateDoctorByDoctorId);
router.delete("/doctor-id/:doctorId", deleteDoctorByDoctorId);

// Hard delete endpoints (permanent deletion)
router.delete("/:id/hard", hardDeleteDoctor);
router.delete("/doctor-id/:doctorId/hard", hardDeleteDoctorByDoctorId);

// Search and filter endpoints
router.get("/specialization/:specialization", getDoctorsBySpecialization);
router.get("/department/:department", getDoctorsByDepartment);
router.get("/search/:searchTerm", searchDoctorsByName);
router.get("/available", getAvailableDoctors);

export default router;