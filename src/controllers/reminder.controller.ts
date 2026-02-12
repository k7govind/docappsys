import { Request, Response } from "express";
import Appointment from "../models/appointment.model.js";
import reminderScheduler from "../services/reminder-scheduler.service.js";

export const sendReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid appointment ID" 
      });
    }
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.AppointmentStatus !== "scheduled") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot send reminder for cancelled or completed appointments" 
      });
    }

    const reminderSent = await reminderScheduler.sendImmediateReminder(id as string);
    
    if (reminderSent) {
      await Appointment.findByIdAndUpdate(id, {
        lastReminderSent: new Date(),
        emailReminderSent: true,
        smsReminderSent: true
      });
    }

    res.json({ 
      success: reminderSent, 
      message: reminderSent ? "Reminder sent successfully" : "Failed to send reminder" 
    });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const updateReminderPreferences = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, sms, reminderTime } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    const reminderPreferences = {
      email: email !== undefined ? email : appointment.reminderPreferences?.email ?? true,
      sms: sms !== undefined ? sms : appointment.reminderPreferences?.sms ?? true,
      reminderTime: reminderTime !== undefined ? reminderTime : appointment.reminderPreferences?.reminderTime ?? 24
    };

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { reminderPreferences },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Reminder preferences updated successfully",
      data: updatedAppointment?.reminderPreferences
    });
  } catch (error) {
    console.error("Error updating reminder preferences:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const getReminderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id).select('emailReminderSent smsReminderSent reminderPreferences lastReminderSent');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    res.json({
      success: true,
      data: {
        emailReminderSent: appointment.emailReminderSent,
        smsReminderSent: appointment.smsReminderSent,
        reminderPreferences: appointment.reminderPreferences,
        lastReminderSent: appointment.lastReminderSent
      }
    });
  } catch (error) {
    console.error("Error getting reminder status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const testReminderJob = async (req: Request, res: Response) => {
  try {
    const result = await reminderScheduler.sendDailyReminders();
    
    res.json({
      success: true,
      message: "Test reminder job completed",
      data: result
    });
  } catch (error) {
    console.error("Error testing reminder job:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const getJobStatus = async (req: Request, res: Response) => {
  try {
    const status = reminderScheduler.getJobStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error("Error getting job status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};