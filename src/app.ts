import express from "express";
import appointmentRoutes from "./routes/appointment.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import requestLogger from "./middleware/requestLogger.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Doctor Appointment Booking System" });
});

app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);

export default app;
