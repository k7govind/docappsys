import { Router } from "express";
import { createAppointment, getAllAppointments, getAppointmentById, deleteAppointment } from "../controller/AppointmentController.js";
const router = Router();
router.post("/", createAppointment);
router.get("/:id", getAppointmentById);
router.get("/", getAllAppointments);
router.delete("/:id", deleteAppointment);
export default router;
