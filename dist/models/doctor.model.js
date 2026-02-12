import mongoose, { Schema } from "mongoose";
const doctorSchema = new Schema({
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
                validator: function (v) {
                    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: "Start time must be in HH:MM format (24-hour)"
            }
        },
        end: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
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
}, {
    timestamps: true
});
// Indexes for better performance (doctorId and email are already unique indexed by unique: true)
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ isActive: 1 });
// Virtual for full name
doctorSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
// Ensure virtual fields are serialized
doctorSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        const { __v, ...rest } = ret;
        return rest;
    }
});
const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
