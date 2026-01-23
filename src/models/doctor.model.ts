import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  experience: number;
  qualification: string;
  consultationFee: number;
  availableDays: string[];
  availableTime: {
    start: string;
    end: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    doctorId: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true
    },
    firstName: { 
      type: String, 
      required: true,
      trim: true
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: true,
      trim: true
    },
    specialization: { 
      type: String, 
      required: true,
      trim: true
    },
    department: { 
      type: String, 
      required: true,
      trim: true
    },
    experience: { 
      type: Number, 
      required: true,
      min: 0,
      max: 50
    },
    qualification: { 
      type: String, 
      required: true,
      trim: true
    },
    consultationFee: { 
      type: Number, 
      required: true,
      min: 0
    },
    availableDays: { 
      type: [String], 
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    availableTime: {
      start: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v: string) {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: "Start time must be in HH:MM format (24-hour)"
        }
      },
      end: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v: string) {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: "End time must be in HH:MM format (24-hour)"
        }
      }
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
doctorSchema.index({ doctorId: 1 });
doctorSchema.index({ email: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ isActive: 1 });

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
doctorSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    const { __v, ...rest } = ret;
    return rest;
  }
});

const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);

export default Doctor;