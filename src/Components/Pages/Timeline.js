import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  MdFavorite,
  MdSentimentVeryDissatisfied,
  MdVolumeUp,
  MdCheckCircle,
} from "react-icons/md";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { deriveEventsFromSnapshots } from "../../EvaluationEngine/Engine";


const META = {
  vital: { icon: <MdFavorite />, color: "#ef4444", label: "Vitals" },
  emotion: {
    icon: <MdSentimentVeryDissatisfied />,
    color: "#f59e0b",
    label: "Vision",
  },
  audio: { icon: <MdVolumeUp />, color: "#6366f1", label: "Audio" },
  system: { icon: <MdCheckCircle />, color: "#22c55e", label: "System" },
};

const severityColor = {
  low: "success",
  medium: "warning",
  high: "error",
};

const normalizeTimestamp = (ts) => {
  if (!ts) return Date.now();
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (typeof ts === "number") return ts * 1000;
  return Date.parse(ts);
};

const ActivityTimelinePage = () => {
  const [snapshots, setSnapshots] = useState([]);

  /* ---------- FETCH SNAPSHOTS FROM DB ---------- */
  useEffect(() => {
    const q = query(
      collection(db, "readings"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const rows = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            timestamp: normalizeTimestamp(d.timestamp),
            temperature: d.temperature,
            heart_rate: d.heart_rate,
            humidity: d.humidity,
            behavior: d.behavior,
            confidence: d.confidence ?? 1,
          };
        });

        setSnapshots(rows);
      }
    });

    return () => unsub();
  }, []);

  /* ---------- DERIVE EVENTS ---------- */
  const events = useMemo(() => {
    return deriveEventsFromSnapshots(snapshots);
  }, [snapshots]);

  const highSeverityCount = events.filter(
    (e) => e.severity === "high"
  ).length;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        pl: { md: 6 },
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={1}>
        Activity Timeline
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Derived system events from real-time sensor snapshots
      </Typography>

      {/* SUMMARY */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography fontWeight={600}>Total Events</Typography>
            <Typography variant="h3">{events.length}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography fontWeight={600}>High Severity</Typography>
            <Typography variant="h3">{highSeverityCount}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography fontWeight={600}>System State</Typography>
            <Chip
              label={highSeverityCount > 0 ? "Attention Needed" : "Stable"}
              color={highSeverityCount > 0 ? "warning" : "success"}
            />
          </CardContent>
        </Card>
      </Box>

      {/* TIMELINE */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {events.map((event, idx) => (
          <Card key={idx}>
            <CardContent>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ fontSize: 26, color: META[event.source].color }}>
                  {META[event.source].icon}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{event.title}</Typography>
                  <Typography fontSize={13} color="text.secondary">
                    {event.description}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Chip
                    size="small"
                    label={event.severity}
                    color={severityColor[event.severity]}
                  />
                  <Typography fontSize={12} color="text.secondary">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mt: 2 }} />
              <Typography fontSize={12} color="text.secondary" mt={1}>
                Source: {META[event.source].label} subsystem
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ActivityTimelinePage;
