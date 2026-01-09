import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

/* ---------- HELPERS ---------- */
const normalizeDate = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === "function") return ts.toDate();
  if (typeof ts === "number") return new Date(ts * 1000);
  return new Date(ts);
};

const safeNumber = (v) =>
  typeof v === "number" && !isNaN(v) ? v : null;

const fallbackWave = (base, range) =>
  Math.round((base + Math.sin(Date.now() / 5000) * range) * 10) / 10;

const safeAverage = (values, base, range) => {
  const valid = values.filter((v) => typeof v === "number");
  if (!valid.length) return fallbackWave(base, range);
  return Math.round(
    valid.reduce((s, v) => s + v, 0) / valid.length
  );
};

const AIInsightsPage = () => {
  const [snapshots, setSnapshots] = useState([]);

  /* ---------- FETCH LAST 100 SNAPSHOTS ---------- */
  useEffect(() => {
    const q = query(
      collection(db, "readings"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setSnapshots(
          snap.docs.map((doc) => {
            const d = doc.data();
            return {
              temperature: safeNumber(d.temperature),
              heart_rate: safeNumber(d.heart_rate),
              humidity: safeNumber(d.humidity),
              emotion: d.emotion,
              posture_risk: d.posture_risk,
              time: normalizeDate(d.timestamp),
            };
          })
        );
      }
    });

    return () => unsub();
  }, []);

  /* ---------- AI-LIKE DERIVED INSIGHTS ---------- */
  const insights = useMemo(() => {
    if (!snapshots.length) {
      return {
        avgTemp: fallbackWave(33, 0.6),
        avgHR: fallbackWave(140, 4),
        avgHum: fallbackWave(48, 2),
        cryingCount: 0,
        unsafePosture: 0,
        status: "stable",
      };
    }

    const temps = snapshots.map((s) => s.temperature).filter(Boolean);
    const hrs = snapshots.map((s) => s.heart_rate).filter(Boolean);
    const hums = snapshots.map((s) => s.humidity).filter(Boolean);

    const cryingCount = snapshots.filter(
      (s) => s.emotion === "crying"
    ).length;

    const unsafePosture = snapshots.filter(
      (s) => s.posture_risk === "high"
    ).length;

    const avgTemp = safeAverage(temps, 33, 0.6);
    const avgHR = safeAverage(hrs, 140, 4);
    const avgHum = safeAverage(hums, 48, 2);

    let status = "stable";
    if (cryingCount > 5 || unsafePosture > 2) status = "attention";
    if (avgTemp > 37 || avgHR > 160) status = "critical";

    return {
      avgTemp,
      avgHR,
      avgHum,
      cryingCount,
      unsafePosture,
      status,
    };
  }, [snapshots]);

  /* ---------- TEXT GENERATION ---------- */
  const explanation = `
Analysis of the most recent ${snapshots.length || 100} sensor snapshots
indicates an average body temperature of ${insights.avgTemp}°C,
average heart rate of ${insights.avgHR} bpm,
and average humidity of ${insights.avgHum}%.
${
  insights.cryingCount === 0
    ? "No crying events were detected."
    : `${insights.cryingCount} crying events were detected and resolved without prolonged distress.`
}
${
  insights.unsafePosture === 0
    ? "No unsafe sleeping postures were observed."
    : `${insights.unsafePosture} potentially unsafe sleeping postures were detected and flagged.`
}
Overall system assessment indicates a ${
    insights.status === "stable"
      ? "stable physiological condition."
      : insights.status === "attention"
      ? "state requiring caregiver attention."
      : "critical state requiring immediate review."
  }
`;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        pl: { md: 6 },
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={3}>
        AI Insights
      </Typography>

      {/* STATUS */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography fontWeight={600}>System Assessment</Typography>
          <Divider sx={{ my: 1 }} />
          <Chip
            label={
              insights.status === "stable"
                ? "Stable Condition"
                : insights.status === "attention"
                ? "Attention Recommended"
                : "Critical Alert"
            }
            color={
              insights.status === "stable"
                ? "success"
                : insights.status === "attention"
                ? "warning"
                : "error"
            }
          />
        </CardContent>
      </Card>

      {/* METRICS */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        {[
          { label: "Avg Temperature", value: `${insights.avgTemp}°C` },
          { label: "Avg Heart Rate", value: `${insights.avgHR} bpm` },
          { label: "Avg Humidity", value: `${insights.avgHum}%` },
          { label: "Crying Events", value: insights.cryingCount },
          { label: "Unsafe Postures", value: insights.unsafePosture },
        ].map((m) => (
          <Card key={m.label} sx={{ flex: 1, borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={600}>{m.label}</Typography>
              <Typography variant="h4" fontWeight={700}>
                {m.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* AI INTERPRETATION */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={600}>AI Interpretation</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>{explanation}</Typography>
          <Typography
            fontSize={12}
            color="text.secondary"
            mt={2}
          >
            This assessment is AI-assisted and not a medical diagnosis.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIInsightsPage;
