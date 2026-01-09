import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  MdSentimentSatisfiedAlt,
  MdSentimentVeryDissatisfied,
  MdWarning,
} from "react-icons/md";
import {
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

/* ---------- HELPERS ---------- */
const normalizeTs = (ts) => {
  if (!ts) return Date.now();
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (typeof ts === "number") return ts * 1000;
  return new Date(ts).getTime();
};

const META = {
  sleeping: {
    label: "Sleeping",
    color: "#6366f1",
    icon: <MdSentimentSatisfiedAlt />,
  },
  crying: {
    label: "Crying",
    color: "#f59e0b",
    icon: <MdSentimentVeryDissatisfied />,
  },
  distress: {
    label: "Unsafe Posture",
    color: "#ef4444",
    icon: <MdWarning />,
  },
};

const EmotionDetectionPage = () => {
  const [snapshots, setSnapshots] = useState([]);

  /* ---------- FETCH SNAPSHOTS ---------- */
  useEffect(() => {
    const q = query(collection(db, "readings"));

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;

      const rows = snap.docs
        .map((d) => {
          const r = d.data();
          return {
            ts: normalizeTs(r.timestamp),
            emotion: r.emotion,
            posture: r.posture,
            posture_risk: r.posture_risk,
            confidence: r.confidence ?? 0.9,
            image_url: r.image_url,
          };
        })
        .filter((r) => r.image_url)
        .sort((a, b) => a.ts - b.ts)
        .slice(-12);

      setSnapshots(rows);
    });

    return () => unsub();
  }, []);

  /* ---------- DERIVED DATA (ALWAYS RUNS) ---------- */
  const latest = snapshots[snapshots.length - 1];

  const derivedEmotion =
    latest?.posture_risk === "high"
      ? "distress"
      : latest?.emotion;

  const counts = useMemo(() => {
    return snapshots.reduce(
      (acc, s) => {
        const key =
          s.posture_risk === "high" ? "distress" : s.emotion;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { sleeping: 0, crying: 0, distress: 0 }
    );
  }, [snapshots]);

  /* ---------- EMPTY STATE ---------- */
  if (!snapshots.length || !latest) {
    return (
      <Box p={4}>
        <Typography>Waiting for vision data…</Typography>
      </Box>
    );
  }

  /* ---------- UI ---------- */
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
        Emotion & Vision Analysis
      </Typography>

      {/* HERO IMAGE */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          mb: 4,
        }}
      >
        <Box
          component="img"
          src={latest.image_url}
          alt="Latest frame"
          sx={{
            width: "100%",
            height: 420,
            objectFit: "cover",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
            color: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ fontSize: 28 }}>
              {META[derivedEmotion].icon}
            </Box>
            <Typography variant="h6">
              {META[derivedEmotion].label}
            </Typography>
            <Chip
              label={
                latest.posture_risk === "high"
                  ? "High Risk"
                  : "Normal"
              }
              sx={{
                ml: "auto",
                backgroundColor: META[derivedEmotion].color,
                color: "#fff",
              }}
            />
          </Box>

          <Typography fontSize={13} sx={{ opacity: 0.85 }}>
            Detected {new Date(latest.ts).toLocaleTimeString()}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={latest.confidence * 100}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: META[derivedEmotion].color,
              },
            }}
          />
        </Box>
      </Box>

      {/* COUNTS */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        {Object.keys(counts).map((k) => (
          <Box
            key={k}
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor: "#f9fafb",
              borderLeft: `5px solid ${META[k].color}`,
            }}
          >
            <Typography fontWeight={600}>
              {META[k].label}
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              {counts[k]}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              detections
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default EmotionDetectionPage;
