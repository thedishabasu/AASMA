"use server";

import { prisma } from "@/lib/prisma";

export async function getPatients() {
    try {
        return await prisma.patient.findMany({
            include: {
                doctor: true,
                prescriptions: true
            },
            orderBy: { lastUpdated: 'desc' }
        });
    } catch (e) {
        console.error("Error fetching patients:", e);
        return [];
    }
}

export async function getPatientById(id: string) {
    try {
        return await prisma.patient.findUnique({
            where: { id },
            include: {
                doctor: true,
                prescriptions: true
            }
        });
    } catch (e) {
        console.error("Error fetching patient:", e);
        return null;
    }
}

export async function getDoctors() {
    try {
        return await prisma.doctor.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("Error fetching doctors:", e);
        return [];
    }
}
