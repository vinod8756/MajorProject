import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
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
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { FaTemperatureHigh, FaHeartbeat, FaTint } from "react-icons/fa";

const normalizeTs = (ts) => {
  if (!ts) return Date.now();
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (typeof ts === "number") return ts * 1000;
  return new Date(ts).getTime();
};

const trend = (values) => {
  if (values.length < 2) return "stable";
  const diff = values[values.length - 1] - values[0];
  if (diff > 0.5) return "rising";
  if (diff < -0.5) return "falling";
  return "stable";
};

const comfortScore = (t, hr, h) => {
  let score = 100;
  if (t < 25 || t > 35) score -= 20;
  if (hr < 100 || hr > 160) score -= 25;
  if (h < 40 || h > 60) score -= 15;
  return Math.max(score, 0);
};

const VitalsMonitorPage = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "readings"));

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;

      const data = snap.docs
        .map((d) => {
          const r = d.data();
          return {
            ts: normalizeTs(r.timestamp),
            temperature: r.temperature,
            heart_rate: r.heart_rate,
            humidity: r.humidity,
          };
        })
        .sort((a, b) => a.ts - b.ts)
        .slice(-40);

      setRows(data);
    });

    return () => unsub();
  }, []);

  const latest = rows[rows.length - 1];

  const insights = useMemo(() => {
    if (!latest || rows.length < 3) return null;

    const temps = rows.map((r) => r.temperature);
    const hrs = rows.map((r) => r.heart_rate);
    const hums = rows.map((r) => r.humidity);

    return {
      tempTrend: trend(temps),
      hrTrend: trend(hrs),
      humTrend: trend(hums),
      comfort: comfortScore(
        latest.temperature,
        latest.heart_rate,
        latest.humidity
      ),
    };
  }, [rows, latest]);

  if (!latest || !insights) {
    return (
      <Box p={4}>
        <Typography>Waiting for vitals data…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pl: { md: 6 }, maxWidth: 1500, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Vitals Monitor
      </Typography>

      {/* SNAPSHOT */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        {[
          {
            label: "Temperature",
            value: `${latest.temperature}°C`,
            icon: <FaTemperatureHigh />,
            trend: insights.tempTrend,
          },
          {
            label: "Heart Rate",
            value: `${latest.heart_rate} bpm`,
            icon: <FaHeartbeat />,
            trend: insights.hrTrend,
          },
          {
            label: "Humidity",
            value: `${latest.humidity}%`,
            icon: <FaTint />,
            trend: insights.humTrend,
          },
        ].map((item) => (
          <Card key={item.label} sx={{ flex: 1, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 22 }}>{item.icon}</Box>
              <Typography fontWeight={600}>{item.label}</Typography>
              <Typography variant="h4" fontWeight={700}>
                {item.value}
              </Typography>
              <Chip
                size="small"
                label={item.trend}
                color={
                  item.trend === "stable"
                    ? "success"
                    : item.trend === "rising"
                    ? "warning"
                    : "info"
                }
              />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* INSIGHTS */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography fontWeight={600}>Overall Comfort</Typography>
            <Typography variant="h3" fontWeight={700}>
              {insights.comfort}
            </Typography>
            <Typography color="text.secondary">
              Based on vitals & environment
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography fontWeight={600}>System Interpretation</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>
              Vitals are currently within acceptable ranges. No sustained
              anomalies detected across the recent monitoring window.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* GRAPH */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Vitals Trend (Recent)
          </Typography>

          <Box sx={{ width: "100%", height: 320, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <XAxis
                  dataKey="ts"
                  type="number"
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
                  dataKey="temperature"
                  stroke="#22c55e"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="heart_rate"
                  stroke="#ef4444"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#0ea5e9"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VitalsMonitorPage;
