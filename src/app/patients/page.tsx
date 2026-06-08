import { prisma } from "@/lib/prisma";
import PatientTableClient from "./patient-table-client";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
    let dbPatients: any[] = [];

    try {
        dbPatients = await prisma.patient.findMany({
            orderBy: { lastUpdated: 'desc' }
        });
    } catch (e) {
        console.error("Database connection failed:", e);
        // Graceful fallback — page still renders with empty data
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100">Patient Directory</h1>
                    <p className="text-slate-400 mt-1">Manage and monitor patient records, interactive SHAP variables, and AI risk logs.</p>
                </div>
            </div>

            <PatientTableClient initialData={dbPatients} />
        </div>
    );
}
