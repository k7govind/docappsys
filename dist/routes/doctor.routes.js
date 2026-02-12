"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DoctorController_js_1 = require("../controller/DoctorController.js");
const router = (0, express_1.Router)();
// Basic CRUD operations
router.post("/", DoctorController_js_1.createDoctor);
router.get("/", DoctorController_js_1.getAllDoctors);
router.get("/:id", DoctorController_js_1.getDoctorById);
router.put("/:id", DoctorController_js_1.updateDoctor);
router.delete("/:id", DoctorController_js_1.deleteDoctor);
// Operations using doctorId
router.get("/doctor-id/:doctorId", DoctorController_js_1.getDoctorByDoctorId);
router.put("/doctor-id/:doctorId", DoctorController_js_1.updateDoctorByDoctorId);
router.delete("/doctor-id/:doctorId", DoctorController_js_1.deleteDoctorByDoctorId);
// Hard delete endpoints (permanent deletion)
router.delete("/:id/hard", DoctorController_js_1.hardDeleteDoctor);
router.delete("/doctor-id/:doctorId/hard", DoctorController_js_1.hardDeleteDoctorByDoctorId);
// Search and filter endpoints
router.get("/specialization/:specialization", DoctorController_js_1.getDoctorsBySpecialization);
router.get("/department/:department", DoctorController_js_1.getDoctorsByDepartment);
router.get("/search/:searchTerm", DoctorController_js_1.searchDoctorsByName);
router.get("/available", DoctorController_js_1.getAvailableDoctors);
exports.default = router;
