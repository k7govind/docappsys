"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointment_routes_js_1 = __importDefault(require("./routes/appointment.routes.js"));
const doctor_routes_js_1 = __importDefault(require("./routes/doctor.routes.js"));
const requestLogger_js_1 = __importDefault(require("./middleware/requestLogger.js"));
const db_js_1 = require("./config/db.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(requestLogger_js_1.default);
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Doctor Appointment Booking System" });
});
// Add database connection check for API routes
app.use("/api/appointments", db_js_1.ensureDatabaseConnection, appointment_routes_js_1.default);
app.use("/api/doctors", db_js_1.ensureDatabaseConnection, doctor_routes_js_1.default);
exports.default = app;
