import express from "express";
import cookieParser from "cookie-parser";
import appointmentRoutes from "./routes/appointment.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/auth", authRoutes);

export default app;