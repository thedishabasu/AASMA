"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPatient(data: any) {
    try {
        const patient = await prisma.patient.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                age: parseInt(data.age),
                gender: data.gender,
                medicalHistory: data.medicalHistory || "None",
                heartRate: parseFloat(data.heartRate) || 70,
                hrv: parseFloat(data.hrv) || 50,
                systolicBp: parseFloat(data.systolicBp) || 120,
                diastolicBp: parseFloat(data.diastolicBp) || 80,
                spo2: parseFloat(data.spo2) || 98,
                temperature: parseFloat(data.temperature) || 36.5,
                activityLevel: parseFloat(data.activityLevel) || 5.0,
                pm25: parseFloat(data.pm25) || 15.0,
                aqi: parseFloat(data.aqi) || 45.0,
                riskScore: parseFloat(data.riskScore) || 45.0,
                status: data.status || "Stable",
                adherenceRate: parseFloat(data.adherenceRate) || 0.85,
                
                // New Vitals
                respiratoryRate: parseFloat(data.respiratoryRate) || 16.0,
                glucoseLevel: parseFloat(data.glucoseLevel) || 100.0,
                cholesterol: parseFloat(data.cholesterol) || 200.0,
                bmi: parseFloat(data.bmi) || 22.0,

                // Behavioral Data
                dailyFiberIntake: parseFloat(data.dailyFiberIntake) || 25.0,
                sleepHours: parseFloat(data.sleepHours) || 7.0,
                stressLevel: parseFloat(data.stressLevel) || 3.0,
                smokingStatus: data.smokingStatus || "None",
                alcoholIntake: parseFloat(data.alcoholIntake) || 0.0,
                exerciseMinutes: parseFloat(data.exerciseMinutes) || 30.0,
                medicineAdherence: data.medicineAdherence === "true" || data.medicineAdherence === true
            },
        });

        revalidatePath("/patients");
        revalidatePath("/");
        return { success: true, patient };
    } catch (error: any) {
        console.error("Error creating patient:", error);
        return { success: false, error: error.message };
    }
}

export async function updatePatient(id: string, data: any) {
    try {
        const patient = await prisma.patient.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                age: parseInt(data.age),
                gender: data.gender,
                medicalHistory: data.medicalHistory,
                heartRate: parseFloat(data.heartRate),
                hrv: parseFloat(data.hrv),
                systolicBp: parseFloat(data.systolicBp),
                diastolicBp: parseFloat(data.diastolicBp),
                spo2: parseFloat(data.spo2),
                temperature: parseFloat(data.temperature),
                activityLevel: parseFloat(data.activityLevel),
                pm25: parseFloat(data.pm25),
                aqi: parseFloat(data.aqi),
                riskScore: parseFloat(data.riskScore),
                status: data.status,
                adherenceRate: parseFloat(data.adherenceRate),

                // New Vitals
                respiratoryRate: parseFloat(data.respiratoryRate),
                glucoseLevel: parseFloat(data.glucoseLevel),
                cholesterol: parseFloat(data.cholesterol),
                bmi: parseFloat(data.bmi),

                // Behavioral Data
                dailyFiberIntake: parseFloat(data.dailyFiberIntake),
                sleepHours: parseFloat(data.sleepHours),
                stressLevel: parseFloat(data.stressLevel),
                smokingStatus: data.smokingStatus,
                alcoholIntake: parseFloat(data.alcoholIntake),
                exerciseMinutes: parseFloat(data.exerciseMinutes),
                medicineAdherence: data.medicineAdherence === "true" || data.medicineAdherence === true
            },
        });

        revalidatePath("/patients");
        revalidatePath("/");
        return { success: true, patient };
    } catch (error: any) {
        console.error("Error updating patient:", error);
        return { success: false, error: error.message };
    }
}

export async function deletePatient(id: string) {
    try {
        await prisma.patient.delete({ where: { id } });
        revalidatePath("/patients");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
