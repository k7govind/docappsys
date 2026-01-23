import express from "express";
import appointmentRoutes from "./routes/appointment.routes.js";
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "API is working!" });
});
app.use("/api/appointments", appointmentRoutes);
export default app;
