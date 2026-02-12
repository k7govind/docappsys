import express from "express";
import appointmentRoutes from "./routes/appointment.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import requestLogger from "./middleware/requestLogger.js";
import { ensureDatabaseConnection } from "./config/db.js";
//import authRoutes from "./routes/auth.routes.js";
import "./reminders.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Doctor Appointment Booking System" });
});

// Add database connection check for API routes
app.use("/api/appointments", ensureDatabaseConnection, appointmentRoutes);
app.use("/api/doctors", ensureDatabaseConnection, doctorRoutes);

export default app;
