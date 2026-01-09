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
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

/* ---------- HELPERS ---------- */
const calcAgeMonths = (dob) => {
  if (!dob) return "-";

  let birthDate;

  if (typeof dob.toDate === "function") {
    // Firestore Timestamp
    birthDate = dob.toDate();
  } else {
    // Fallback (string or JS Date)
    birthDate = new Date(dob);
  }

  const now = new Date();

  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());

  return months >= 0 ? months : 0;
};


const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [readings, setReadings] = useState([]);

  /* ---------- FETCH PROFILE ---------- */
  useEffect(() => {
    const fetchProfile = async () => {
      const snap = await getDoc(
        doc(db, "baby_profile", "primary")
      );
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, []);

  /* ---------- FETCH READINGS ---------- */
  useEffect(() => {
    const q = query(
      collection(db, "readings"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setReadings(snap.docs.map((d) => d.data()));
      }
    });

    return () => unsub();
  }, []);

  /* ---------- DERIVED HEALTH ---------- */
  const health = useMemo(() => {
    if (!readings.length) return null;

    const crying = readings.filter(
      (r) => r.behavior === "crying"
    ).length;

    const calmPct = Math.round(
      ((readings.length - crying) / readings.length) * 100
    );

    const avgHR = Math.round(
      readings.reduce((s, r) => s + r.heart_rate, 0) /
        readings.length
    );

    return {
      overall:
        calmPct > 80 && avgHR < 150 ? "Good" : "Needs Attention",
      sleep:
        calmPct > 85 ? "Stable" : "Fragmented",
      activity:
        avgHR < 145 ? "Normal" : "Elevated",
    };
  }, [readings]);

  if (!profile || !health) {
    return (
      <Box p={4}>
        <Typography>Loading profile…</Typography>
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
        Baby Profile
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography fontWeight={600}>Basic Info</Typography>
          <Divider sx={{ my: 2 }} />

          <Info label="Name" value={profile.name} />
          <Info
            label="Age"
            value={`${calcAgeMonths(profile.dob)} months`}
          />
          <Info
            label="Weight"
            value={`${profile.weight_kg} kg`}
          />
          <Info
            label="Height"
            value={`${profile.height_cm} cm`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography fontWeight={600}>
            Derived Health Summary
          </Typography>
          <Divider sx={{ my: 2 }} />

          <HealthChip
            label="Overall Health"
            value={health.overall}
            color={
              health.overall === "Good"
                ? "success"
                : "warning"
            }
          />
          <HealthChip
            label="Sleep Quality"
            value={health.sleep}
            color="info"
          />
          <HealthChip
            label="Activity Level"
            value={health.activity}
            color="info"
          />

          <Typography
            fontSize={12}
            color="text.secondary"
            mt={2}
          >
            Health indicators are derived automatically from the last
            100 sensor snapshots.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

const Info = ({ label, value }) => (
  <Box mb={1}>
    <Typography fontSize={13} color="text.secondary">
      {label}
    </Typography>
    <Typography fontWeight={600}>{value}</Typography>
  </Box>
);

const HealthChip = ({ label, value, color }) => (
  <Box mb={1}>
    <Typography fontSize={13} color="text.secondary">
      {label}
    </Typography>
    <Chip label={value} color={color} />
  </Box>
);

export default ProfilePage;
