import { Router } from "express";
import { createAppointment, getAllAppointments, getAppointmentById, deleteAppointment } from "../controller/AppointmentController.js";
import { sendReminder, updateReminderPreferences, getReminderStatus, testReminderJob, getJobStatus } from "../controllers/reminder.controller.js";

const router : Router = Router();

router.post("/", createAppointment);
router.get("/:id", getAppointmentById);
router.get("/", getAllAppointments);
router.delete("/:id", deleteAppointment);

router.post("/:id/remind", sendReminder);
router.put("/:id/reminder-preferences", updateReminderPreferences);
router.get("/:id/reminder-status", getReminderStatus);
router.post("/test-reminder-job", testReminderJob);
router.get("/reminder-job/status", getJobStatus);

export default router;
