import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(
        doc(db, "system_settings", "primary")
      );
      if (snap.exists()) setSettings(snap.data());
    };
    fetchSettings();
  }, []);

  if (!settings) {
    return (
      <Box p={4}>
        <Typography>Loading settings…</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        pl: { md: 6 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={3}>
        System Settings
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography fontWeight={600}>
            Alert Configuration
          </Typography>
          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch checked={settings.alerts_enabled} />
            }
            label="Enable Alerts"
          />

          <Typography fontSize={14} mt={2}>
            Alert Sensitivity
          </Typography>
          <Select
            fullWidth
            value={settings.alert_sensitivity}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography fontWeight={600}>
            Data Preferences
          </Typography>
          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch checked={settings.store_history} />
            }
            label="Store Historical Data"
          />

          <Typography fontSize={14} mt={2}>
            Refresh Interval
          </Typography>
          <Select
            fullWidth
            value={settings.refresh_interval}
          >
            <MenuItem value={10}>10 seconds</MenuItem>
            <MenuItem value={30}>30 seconds</MenuItem>
            <MenuItem value={60}>1 minute</MenuItem>
          </Select>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
