"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Doctor Actions ---

export async function getDoctors() {
    try {
        return await prisma.doctor.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { patients: true } } }
        });
    } catch (e) {
        console.error("Error fetching doctors:", e);
        return [];
    }
}

export async function addDoctor(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const specialty = formData.get("specialty") as string;
        const hospital = formData.get("hospital") as string;
        const email = formData.get("email") as string;

        const doctor = await prisma.doctor.create({
            data: {
                name,
                specialty,
                hospital,
                email,
                shiftHours: 8,
                patientLoad: 10,
                sleepHours: 7,
                burnoutRisk: 0.15
            }
        });

        revalidatePath("/admin/staff");
        return { success: true, doctor };
    } catch (error: any) {
        console.error("Error adding doctor:", error);
        return { success: false, error: error.message };
    }
}

export async function updateDoctorBurnout(id: string, shiftHours: number, patientLoad: number, sleepHours: number) {
    try {
        const hoursScore = Math.min(shiftHours / 16, 1);
        const loadScore = Math.min(patientLoad / 40, 1);
        const sleepScore = Math.min((8 - sleepHours) / 5, 1);
        const risk = (hoursScore * 0.5) + (loadScore * 0.3) + (Math.max(0, sleepScore) * 0.2);

        await prisma.doctor.update({
            where: { id },
            data: {
                shiftHours,
                patientLoad,
                sleepHours,
                burnoutRisk: Math.min(risk, 1.0)
            }
        });

        revalidatePath("/admin/staff");
        return { success: true, risk: Math.min(risk, 1.0) };
    } catch (e: any) {
        console.error("Error updating burnout:", e);
        return { success: false, error: e.message };
    }
}

export async function deleteDoctor(id: string) {
    try {
        await prisma.doctor.delete({ where: { id } });
        revalidatePath("/admin/staff");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- Medication Actions ---

export async function getMedications(patientId: string) {
    try {
        return await prisma.medication.findMany({
            where: { patientId },
            orderBy: { startDate: "desc" }
        });
    } catch (e) {
        return [];
    }
}

export async function addMedication(patientId: string, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const dosage = formData.get("dosage") as string;
        const frequency = formData.get("frequency") as string;

        await prisma.medication.create({
            data: {
                name,
                dosage,
                frequency,
                patientId,
                status: "Active"
            }
        });

        revalidatePath(`/patients/${patientId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateMedicationStatus(id: string, status: string, patientId: string) {
    try {
        await prisma.medication.update({
            where: { id },
            data: { status }
        });
        revalidatePath(`/patients/${patientId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteMedication(id: string, patientId: string) {
    try {
        await prisma.medication.delete({ where: { id } });
        revalidatePath(`/patients/${patientId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
