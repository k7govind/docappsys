#!/usr/bin/env node

// Node.js script to seed MongoDB with test data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// Update your MongoDB URI here
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/docappdb';

// Test data
const doctorsData = [
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
    availableTime: {
      start: "09:00",
      end: "17:00"
    },
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
    availableTime: {
      start: "08:00",
      end: "16:00"
    },
    isActive: true
  },
  {
    doctorId: "DOC003",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@hospital.com",
    phone: "+1-555-0125",
    specialization: "Pediatrics",
    department: "Pediatrics",
    experience: 8,
    qualification: "MD, FAAP",
    consultationFee: 200,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: {
      start: "08:30",
      end: "16:30"
    },
    isActive: true
  },
  {
    doctorId: "DOC004",
    firstName: "Emily",
    lastName: "Wilson",
    email: "emily.wilson@hospital.com",
    phone: "+1-555-0126",
    specialization: "Orthopedics",
    department: "Orthopedics",
    experience: 12,
    qualification: "MD, FAOA",
    consultationFee: 280,
    availableDays: ["Tuesday", "Wednesday", "Thursday", "Saturday"],
    availableTime: {
      start: "09:00",
      end: "17:00"
    },
    isActive: true
  },
  {
    doctorId: "DOC005",
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@hospital.com",
    phone: "+1-555-0127",
    specialization: "General Medicine",
    department: "Emergency",
    experience: 20,
    qualification: "MD, FACEP",
    consultationFee: 180,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableTime: {
      start: "07:00",
      end: "19:00"
    },
    isActive: true
  }
];

const appointmentsData = [
  {
    DocID: "DOC001",
    PatientID: "PAT001",
    PatientEmail: "john.smith@example.com",
    PatientAddress: "123 Main St, New York, NY 10001",
    PatientAppointmentDate: new Date("2026-01-25T10:00:00.000Z"),
    AppointmentStatus: "scheduled"
  },
  {
    DocID: "DOC002",
    PatientID: "PAT002",
    PatientEmail: "jane.doe@example.com",
    PatientAddress: "456 Oak Ave, Los Angeles, CA 90001",
    PatientAppointmentDate: new Date("2026-01-26T14:30:00.000Z"),
    AppointmentStatus: "scheduled"
  },
  {
    DocID: "DOC003",
    PatientID: "PAT003",
    PatientEmail: "bob.wilson@example.com",
    PatientAddress: "789 Pine Rd, Chicago, IL 60601",
    PatientAppointmentDate: new Date("2026-01-27T09:15:00.000Z"),
    AppointmentStatus: "completed"
  },
  {
    DocID: "DOC001",
    PatientID: "PAT004",
    PatientEmail: "alice.brown@example.com",
    PatientAddress: "321 Elm St, Houston, TX 77001",
    PatientAppointmentDate: new Date("2026-01-28T11:00:00.000Z"),
    AppointmentStatus: "cancelled"
  },
  {
    DocID: "DOC004",
    PatientID: "PAT005",
    PatientEmail: "charlie.davis@example.com",
    PatientAddress: "654 Maple Dr, Phoenix, AZ 85001",
    PatientAppointmentDate: new Date("2026-01-29T15:30:00.000Z"),
    AppointmentStatus: "scheduled"
  }
];

async function seedDatabase() {
  try {
    console.log(chalk.blue('🔗 Connecting to MongoDB...'));
    await mongoose.connect(MONGO_URI);
    console.log(chalk.green('✅ Connected to MongoDB'));

    // Get database instance
    const db = mongoose.connection.db;

    // Drop existing collections and recreate
    console.log(chalk.yellow('🗑️  Dropping existing collections...'));
    await db.collection('doctors').drop().catch(() => {}); // Ignore if collection doesn't exist
    await db.collection('appointments').drop().catch(() => {}); // Ignore if collection doesn't exist

    // Insert doctors
    console.log(chalk.blue('👨‍⚕️  Inserting doctors...'));
    const doctorsResult = await db.collection('doctors').insertMany(doctorsData);
    console.log(chalk.green(`✅ Inserted ${doctorsResult.insertedCount} doctors`));

    // Insert appointments
    console.log(chalk.blue('📅 Inserting appointments...'));
    const appointmentsResult = await db.collection('appointments').insertMany(appointmentsData);
    console.log(chalk.green(`✅ Inserted ${appointmentsResult.insertedCount} appointments`));

    // Create indexes
    console.log(chalk.blue('🔍 Creating indexes...'));
    
    // Doctor indexes
    await db.collection('doctors').createIndex({ doctorId: 1 }, { unique: true });
    await db.collection('doctors').createIndex({ email: 1 }, { unique: true });
    await db.collection('doctors').createIndex({ specialization: 1 });
    await db.collection('doctors').createIndex({ department: 1 });
    await db.collection('doctors').createIndex({ isActive: 1 });

    // Appointment indexes
    await db.collection('appointments').createIndex({ DocID: 1 });
    await db.collection('appointments').createIndex({ PatientID: 1 });
    await db.collection('appointments').createIndex({ PatientEmail: 1 });
    await db.collection('appointments').createIndex({ AppointmentStatus: 1 });
    await db.collection('appointments').createIndex({ PatientAppointmentDate: 1 });

    console.log(chalk.green('✅ Indexes created successfully'));

    // Display summary
    console.log(chalk.cyan('\n📊 Database Summary:'));
    console.log(chalk.white(`- Database: ${db.databaseName}`));
    console.log(chalk.white(`- Doctors: ${await db.collection('doctors').countDocuments()}`));
    console.log(chalk.white(`- Appointments: ${await db.collection('appointments').countDocuments()}`));

    // Show sample data
    console.log(chalk.cyan('\n👨‍⚕️  Sample Doctors:'));
    const sampleDoctors = await db.collection('doctors').find({}).limit(2).toArray();
    sampleDoctors.forEach((doctor, index) => {
      console.log(chalk.white(`${index + 1}. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization} (${doctor.doctorId})`));
    });

    console.log(chalk.cyan('\n📅 Sample Appointments:'));
    const sampleAppointments = await db.collection('appointments').find({}).limit(2).toArray();
    sampleAppointments.forEach((apt, index) => {
      console.log(chalk.white(`${index + 1}. ${apt.PatientEmail} - ${apt.AppointmentStatus}`));
    });

  } catch (error) {
    console.error(chalk.red('❌ Error seeding database:'), error);
  } finally {
    await mongoose.disconnect();
    console.log(chalk.blue('🔌 Disconnected from MongoDB'));
    console.log(chalk.green('🎉 Database seeding completed!'));
  }
}

// Run the seeding function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };