import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  MdVolumeUp,
  MdHearingDisabled,
  MdWarning,
} from "react-icons/md";

/* ---------- DUMMY AUDIO EVENTS ---------- */
/*
  Future Pi payload:
  {
    type: "cry" | "noise" | "silence"
    confidence: 0–1
    durationSec
    severity: "low" | "medium" | "high"
    timestamp
  }
*/
const AUDIO_EVENTS = [
  {
    type: "cry",
    confidence: 0.89,
    duration: 42,
    severity: "medium",
    time: "3 min ago",
  },
  {
    type: "cry",
    confidence: 0.93,
    duration: 78,
    severity: "high",
    time: "12 min ago",
  },
  {
    type: "noise",
    confidence: 0.71,
    duration: 6,
    severity: "low",
    time: "18 min ago",
  },
];

const meta = {
  cry: {
    label: "Crying Detected",
    icon: <MdWarning />,
    color: "error",
  },
  noise: {
    label: "Loud Noise",
    icon: <MdVolumeUp />,
    color: "warning",
  },
  silence: {
    label: "Calm Environment",
    icon: <MdHearingDisabled />,
    color: "success",
  },
};

const CrySoundAlertsPage = () => {
  const latest = AUDIO_EVENTS[0];

  const interpretation =
    latest.type === "cry" && latest.severity === "high"
      ? "Prolonged crying detected. Immediate attention may be required."
      : latest.type === "cry"
      ? "Short crying episode detected. Baby settled afterward."
      : "Environment appears calm.";

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
        Cry & Sound Alerts
      </Typography>

      {/* CURRENT AUDIO STATE */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ fontSize: 32 }}>
              {meta[latest.type].icon}
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600}>
                {meta[latest.type].label}
              </Typography>
              <Typography color="text.secondary">
                Detected {latest.time}
              </Typography>
            </Box>

            <Chip
              label={`Severity: ${latest.severity}`}
              color={meta[latest.type].color}
              sx={{ ml: "auto" }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography fontWeight={600}>Detection Confidence</Typography>
          <LinearProgress
            variant="determinate"
            value={latest.confidence * 100}
            sx={{ height: 8, borderRadius: 4, my: 1 }}
          />
          <Typography fontSize={13}>
            {(latest.confidence * 100).toFixed(0)}%
          </Typography>

          <Typography mt={2}>
            Duration: <strong>{latest.duration}s</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* INTERPRETATION */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography fontWeight={600}>System Interpretation</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>{interpretation}</Typography>
        </CardContent>
      </Card>

      {/* EVENT TIMELINE */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        Recent Audio Events
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {AUDIO_EVENTS.map((e, idx) => (
          <Card key={idx} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ fontSize: 24 }}>
                  {meta[e.type].icon}
                </Box>
                <Box>
                  <Typography fontWeight={600}>
                    {meta[e.type].label}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">
                    {e.time}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={`${e.duration}s`}
                  sx={{ ml: "auto" }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default CrySoundAlertsPage;
