/**
 * Ingestion Status Card
 * Story 7.1: Real-time status display during ingestion
 * AC3: Real-Time Ingestion Feedback
 */

import { IngestionStatus } from "../types";

type Props = {
    status: IngestionStatus;
};

export function IngestionStatusCard({ status }: Props) {
    if (status.phase === "idle") return null;

    const bgColor = {
        starting: "bg-blue-900/50",
        fetching: "bg-blue-900/50",
        persisting: "bg-blue-900/50",
        complete: "bg-emerald-900/50",
        error: "bg-red-900/50",
    }[status.phase] || "bg-gray-900/50";

    const borderColor = {
        starting: "border-blue-500/30",
        fetching: "border-blue-500/30",
        persisting: "border-blue-500/30",
        complete: "border-emerald-500/30",
        error: "border-red-500/30",
    }[status.phase] || "border-gray-500/30";

    return (
        <div className={`${bgColor} ${borderColor} border rounded-md p-3 mt-3 text-sm`}>
            <p className="text-white font-medium">{status.message}</p>

            {/* AC4: Results Summary */}
            {status.result && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-800/50 rounded p-2">
                        <span className="text-emerald-300">New Jobs</span>
                        <p className="text-white text-lg font-bold">{status.result.newJobs}</p>
                    </div>
                    <div className="bg-amber-800/50 rounded p-2">
                        <span className="text-amber-300">Duplicates</span>
                        <p className="text-white text-lg font-bold">{status.result.duplicates}</p>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {status.result?.errors && status.result.errors.length > 0 && (
                <div className="mt-2 text-red-400 text-xs">
                    <p className="font-semibold">Errors:</p>
                    <ul className="list-disc list-inside">
                        {status.result.errors.map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
