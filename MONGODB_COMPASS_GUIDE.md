# MongoDB Compass Setup Guide

## Method 3: Using MongoDB Compass (GUI)

### Steps:

1. **Install MongoDB Compass** (if not already installed)
   - Download from: https://www.mongodb.com/try/compass
   - Install and open the application

2. **Connect to your local MongoDB**
   - Connection String: `mongodb://127.0.0.1:27017/`
   - Click "Connect"

3. **Create a new database**
   - Click the "+" button next to "Databases"
   - Enter database name: `docappdb`
   - Click "Create Database"

4. **Create Doctors Collection**
   - Click on your database `docappdb`
   - Click "Create Collection"
   - Collection name: `doctors`
   - Click "Create"

5. **Insert Doctor Documents**
   - Click on the `doctors` collection
   - Click "Insert Document"
   - Use JSON mode and paste this data:

```json
[
  {
    "doctorId": "DOC001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@hospital.com",
    "phone": "+1-555-0123",
    "specialization": "Cardiology",
    "department": "Cardiology",
    "experience": 10,
    "qualification": "MD, FACC",
    "consultationFee": 250,
    "availableDays": ["Monday", "Wednesday", "Friday"],
    "availableTime": {
      "start": "09:00",
      "end": "17:00"
    },
    "isActive": true
  },
  {
    "doctorId": "DOC002",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@hospital.com",
    "phone": "+1-555-0124",
    "specialization": "Neurology",
    "department": "Neurology",
    "experience": 15,
    "qualification": "MD, FAAN",
    "consultationFee": 350,
    "availableDays": ["Monday", "Tuesday", "Thursday", "Friday"],
    "availableTime": {
      "start": "08:00",
      "end": "16:00"
    },
    "isActive": true
  }
]
```

6. **Create Appointments Collection**
   - Go back to your database
   - Click "Create Collection"
   - Collection name: `appointments`
   - Click "Create"

7. **Insert Appointment Documents**
   - Click on the `appointments` collection
   - Click "Insert Document"
   - Use JSON mode and paste this data:

```json
[
  {
    "DocID": "DOC001",
    "PatientID": "PAT001",
    "PatientEmail": "john.smith@example.com",
    "PatientAddress": "123 Main St, New York, NY 10001",
    "PatientAppointmentDate": { "$date": "2026-01-25T10:00:00.000Z" },
    "AppointmentStatus": "scheduled"
  },
  {
    "DocID": "DOC002",
    "PatientID": "PAT002",
    "PatientEmail": "jane.doe@example.com",
    "PatientAddress": "456 Oak Ave, Los Angeles, CA 90001",
    "PatientAppointmentDate": { "$date": "2026-01-26T14:30:00.000Z" },
    "AppointmentStatus": "scheduled"
  }
]
```

8. **Create Indexes** (Optional but recommended)
   - Click on the `doctors` collection
   - Click "Indexes" tab
   - Click "Create Index"
   - Index fields: `doctorId: 1`
   - Check "Unique" box
   - Click "Create"

9. **Verify Data**
   - Browse through your collections to verify the data is inserted correctly
   - You can query, filter, and visualize data using Compass interface

### Benefits of MongoDB Compass:
- Visual interface for managing collections
- Query builder for complex queries
- Performance monitoring tools
- Real-time data visualization
- Import/Export functionality