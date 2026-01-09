export const LIMITS = {
    temperature: { min: 25, max: 35 },
    heartRate: { min: 100, max: 160 },
};

export function deriveEventsFromSnapshots(snapshots) {
    if (!Array.isArray(snapshots) || snapshots.length < 2) return [];

    const events = [];

    for (let i = 1; i < snapshots.length; i++) {
        const prev = snapshots[i - 1];
        const curr = snapshots[i];

        if (
            curr.heart_rate > LIMITS.heartRate.max &&
            prev.heart_rate > LIMITS.heartRate.max
        ) {
            events.push({
                source: "vital",
                severity: "high",
                timestamp: curr.timestamp,
                title: "Heart Rate Spike",
                description: `Heart rate exceeded ${LIMITS.heartRate.max} bpm for multiple readings (latest: ${curr.heart_rate} bpm).`,
            });
        }

        if (
            curr.temperature > LIMITS.temperature.max ||
            curr.temperature < LIMITS.temperature.min
        ) {
            events.push({
                source: "vital",
                severity: "medium",
                timestamp: curr.timestamp,
                title: "Temperature Out of Range",
                description: `Temperature measured at ${curr.temperature}°C, outside recommended range.`,
            });
        }

        if (curr.behavior === "crying" && prev.behavior !== "crying") {
            events.push({
                source: "emotion",
                severity: "medium",
                timestamp: curr.timestamp,
                title: "Crying Detected",
                description: `Facial analysis detected crying with ${(curr.confidence * 100).toFixed(
                    0
                )}% confidence.`,
            });
        }

        if (
            curr.behavior === "crying" &&
            prev.behavior === "crying" &&
            curr.confidence > 0.8
        ) {
            events.push({
                source: "audio",
                severity: "high",
                timestamp: curr.timestamp,
                title: "Prolonged Distress",
                description:
                    "Continuous crying detected across multiple intervals.",
            });
        }

        if (prev.behavior === "crying" && curr.behavior !== "crying") {
            events.push({
                source: "system",
                severity: "low",
                timestamp: curr.timestamp,
                title: "Recovered to Calm State",
                description:
                    "Baby returned to a calm state after crying episode.",
            });
        }
    }

    return events;
}
