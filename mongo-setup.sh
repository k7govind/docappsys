#!/bin/bash

# MongoDB Shell Commands for Test Data Setup
# Usage: ./mongo-setup.sh

echo "🔗 Connecting to MongoDB and setting up test data..."

# Connect to MongoDB and run commands
mongosh << 'EOF'
// Use your database
use docappdb;

// Drop existing collections
db.doctors.drop();
db.appointments.drop();

// Insert doctors
db.doctors.insertMany([
  {
    doctorId: "DOC001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@hospital.com",
    phone: "+1-555-0123",
    specialization: "Cardiology",
    department: "Cardiology",
    experience: 10,
    qualification: "MD, FACC",
    consultationFee: 250,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: { start: "09:00", end: "17:00" },
    isActive: true
  },
  {
    doctorId: "DOC002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hospital.com",
    phone: "+1-555-0124",
    specialization: "Neurology",
    department: "Neurology",
    experience: 15,
    qualification: "MD, FAAN",
    consultationFee: 350,
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    availableTime: { start: "08:00", end: "16:00" },
    isActive: true
  }
]);

// Insert appointments
db.appointments.insertMany([
  {
    DocID: "DOC001",
    PatientID: "PAT001",
    PatientEmail: "john.smith@example.com",
    PatientAddress: "123 Main St, New York, NY 10001",
    PatientAppointmentDate: ISODate("2026-01-25T10:00:00.000Z"),
    AppointmentStatus: "scheduled"
  },
  {
    DocID: "DOC002",
    PatientID: "PAT002",
    PatientEmail: "jane.doe@example.com",
    PatientAddress: "456 Oak Ave, Los Angeles, CA 90001",
    PatientAppointmentDate: ISODate("2026-01-26T14:30:00.000Z"),
    AppointmentStatus: "scheduled"
  }
]);

// Create indexes
db.doctors.createIndex({ doctorId: 1 }, { unique: true });
db.doctors.createIndex({ email: 1 }, { unique: true });
db.appointments.createIndex({ DocID: 1 });

// Verify data
print("Doctors: " + db.doctors.countDocuments());
print("Appointments: " + db.appointments.countDocuments());
print("✅ Setup complete!");
EOF

echo "✅ MongoDB test data setup completed!"