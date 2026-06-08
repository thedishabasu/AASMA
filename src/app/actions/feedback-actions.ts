"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitFeedback(data: {
    entityType: string;
    entityId: string;
    feedback: string;
    comments?: string;
    clinicianId?: string;
}) {
    await prisma.clinicalFeedback.create({
        data: {
            entityType: data.entityType,
            entityId: data.entityId,
            feedback: data.feedback,
            comments: data.comments,
            clinicianId: data.clinicianId,
        }
    });

    // In a real scenario, this would trigger an Active Learning re-training job
    console.log(`[Active Learning] Feedback received for ${data.entityType} ${data.entityId}: ${data.feedback}`);
}

export async function getFeedbackCount() {
    return await prisma.clinicalFeedback.count();
}
