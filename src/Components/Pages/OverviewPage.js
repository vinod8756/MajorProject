import { useEffect, useState } from "react";
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
import { FaTemperatureHigh, FaHeartbeat, FaTint } from "react-icons/fa";
import {
  MdOutlinePsychology,
  MdNotificationsActive,
  MdHotel,
} from "react-icons/md";
import {
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

const normalizeTs = (ts) => {
  if (!ts) return Date.now();
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (typeof ts === "number") return ts * 1000;
  return new Date(ts).getTime();
};

const OverviewPage = () => {
  const [latest, setLatest] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "readings"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setConnected(false);
          return;
        }

        const rows = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              ...data,
              _ts: normalizeTs(data.timestamp),
            };
          })
          .sort((a, b) => a._ts - b._ts);

        const last = rows[rows.length - 1];

        setLatest(last);
        setGraphData(
          rows.slice(-5).map((r) => ({
            ts: r._ts,
            temp: r.temperature,
            hr: r.heart_rate,
            hum: r.humidity,
          }))
        );
        setConnected(true);
      },
      () => setConnected(false)
    );

    return () => unsub();
  }, []);

  if (!latest) return null;

  const status =
    latest.posture_risk === "high" ||
    latest.emotion === "crying" ||
    latest.temperature > 37 ||
    latest.heart_rate > 160
      ? { label: "Alert", color: "error" }
      : latest.temperature > 35 || latest.heart_rate > 150
      ? { label: "Attention", color: "warning" }
      : { label: "Baby is Safe", color: "success" };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pl: { md: 6 }, maxWidth: 1500, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Overview
        </Typography>
        <Chip label={connected ? "Live" : "Offline"} color={connected ? "success" : "warning"} />
      </Box>

      <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 3, p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Baby Status
            </Typography>
            <Typography color="text.secondary">
              Last updated {latest.timestamp ? new Date(latest._ts).toLocaleString() : "N/A"}
            </Typography>
          </Box>
          <Chip label={status.label} color={status.color} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        {[
          ["Temperature", `${latest.temperature}°C`, <FaTemperatureHigh />, "#22c55e"],
          ["Heart Rate", `${latest.heart_rate} bpm`, <FaHeartbeat />, "#ef4444"],
          ["Humidity", `${latest.humidity}%`, <FaTint />, "#0ea5e9"],
          ["Emotion", latest.emotion, <MdOutlinePsychology />, "#6366f1"],
          ["Posture", latest.posture, <MdHotel />, latest.posture_risk === "high" ? "#ef4444" : "#22c55e"],
        ].map(([t, v, i, c]) => (
          <Card key={t} sx={{ flex: 1, borderLeft: `5px solid ${c}` }}>
            <CardContent>
              <Box sx={{ fontSize: 22, color: c }}>{i}</Box>
              <Typography fontWeight={600}>{t}</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ textTransform: "capitalize" }}>
                {v}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 3 }}>
        <Card sx={{ flex: 3 }}>
          <CardContent>
            <Typography fontWeight={600} mb={2}>Vitals Trend</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={graphData}>
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
                <Line dataKey="temp" stroke="#22c55e" dot={false} />
                <Line dataKey="hr" stroke="#ef4444" dot={false} />
                <Line dataKey="hum" stroke="#0ea5e9" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography fontWeight={600}>Recent Activity</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <MdNotificationsActive />
              <Typography>Emotion: {latest.emotion}</Typography>
            </Box>
            <Typography fontSize={13}>
              {new Date(latest._ts).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewPage;
