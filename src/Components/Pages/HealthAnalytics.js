import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  collection,
  query,
  orderBy,
  limit,
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

const rollingAverage = (data, key, window = 5) =>
  data.map((_, i, arr) => {
    const slice = arr.slice(Math.max(0, i - window + 1), i + 1);
    const avg =
      slice.reduce((s, d) => s + d[key], 0) / slice.length;
    return Math.round(avg * 10) / 10;
  });

const inRange = {
  temperature: (v) => v >= 25 && v <= 35,
  heart_rate: (v) => v >= 100 && v <= 160,
};

/* ---------- PAGE ---------- */
const HealthTrendsPage = () => {
  const [readings, setReadings] = useState([]);

  /* ---------- FETCH DATA (REALTIME) ---------- */
  useEffect(() => {
    const q = query(
      collection(db, "readings"),
      orderBy("timestamp", "asc"),
      limit(200)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;

      const rows = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          ts: normalizeTs(d.timestamp),
          temperature: d.temperature,
          heart_rate: d.heart_rate,
          humidity: d.humidity,
        };
      });

      setReadings(rows);
    });

    return () => unsub();
  }, []);

  /* ---------- TREND DATA ---------- */
  const trendData = useMemo(() => {
    if (!readings.length) return [];

    const tempAvg = rollingAverage(readings, "temperature");
    const hrAvg = rollingAverage(readings, "heart_rate");

    return readings.map((r, i) => ({
      ts: r.ts,
      tempAvg: tempAvg[i],
      hrAvg: hrAvg[i],
    }));
  }, [readings]);

  /* ---------- STATS ---------- */
  const stats = useMemo(() => {
    if (!readings.length) return null;

    const total = readings.length;

    const calc = (key) => {
      const normal = readings.filter((r) =>
        inRange[key](r[key])
      ).length;
      const pct = Math.round((normal / total) * 100);
      return {
        normalPct: pct,
        anomalyPct: 100 - pct,
      };
    };

    return {
      temperature: calc("temperature"),
      heart_rate: calc("heart_rate"),
    };
  }, [readings]);

  if (!stats) {
    return (
      <Box p={4}>
        <Typography>Collecting trend data…</Typography>
      </Box>
    );
  }

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
        Health Trends
      </Typography>

      {/* SUMMARY */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography fontWeight={600}>
              Temperature Stability
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              {stats.temperature.normalPct}%
            </Typography>
            <Typography color="text.secondary">
              within normal range
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography fontWeight={600}>
              Heart Rate Stability
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              {stats.heart_rate.normalPct}%
            </Typography>
            <Typography color="text.secondary">
              within normal range
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography fontWeight={600}>
              Anomaly Presence
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              {Math.max(
                stats.temperature.anomalyPct,
                stats.heart_rate.anomalyPct
              )}
              %
            </Typography>
            <Typography color="text.secondary">
              combined deviation
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* TREND GRAPH */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Rolling Health Trends
          </Typography>

          <Box sx={{ width: "100%", height: 320, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis
                  dataKey="ts"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(v) =>
                    new Date(v).toLocaleString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="tempAvg"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Temp Avg"
                />
                <Line
                  type="monotone"
                  dataKey="hrAvg"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="HR Avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* INTERPRETATION */}
      <Card>
        <CardContent>
          <Typography fontWeight={600}>
            Health Interpretation
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>
            Over the observed period, vitals remained largely stable.
            Temperature stayed within range for{" "}
            <strong>{stats.temperature.normalPct}%</strong> of the time,
            while heart rate remained stable for{" "}
            <strong>{stats.heart_rate.normalPct}%</strong>.
            No prolonged anomalies were detected.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HealthTrendsPage;
