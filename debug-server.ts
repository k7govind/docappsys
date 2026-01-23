import dotenv from "dotenv";
dotenv.config();

import express from "express";
import appointmentRoutes from "./src/routes/appointment.routes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(express.json());

// Add debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.use("/api/appointments", appointmentRoutes);

// Add 404 handler
app.use("*", (req, res) => {
  console.log(`404 for ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found", path: req.path, method: req.method });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  POST http://localhost:${PORT}/api/appointments`);
  console.log(`  GET  http://localhost:${PORT}/api/appointments`);
  console.log(`  GET  http://localhost:${PORT}/api/appointments/:id`);
  console.log(`  DEL  http://localhost:${PORT}/api/appointments/:id`);
});