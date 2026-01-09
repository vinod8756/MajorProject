import { Box, Toolbar } from "@mui/material";
import Navbar, { drawerWidth } from "../NavBar/NavBar";
import { Routes, Route } from "react-router-dom";
import SettingsPage from "../Pages/SettingsPage";
import OverviewPage from "../Pages/OverviewPage";
import VitalsMonitorPage from "../Pages/VitalsMonitorPage";
import EmotionDetectionPage from "../Pages/EmotionDetectionPage";
import CrySoundAlertsPage from "../Pages/CryPage";
import HealthTrendsPage from "../Pages/HealthAnalytics";
import AIInsightsPage from "../Pages/AIinsights";
import ActivityTimelinePage from "../Pages/Timeline";
import ProfilePage from "../Pages/ProfilePage";

export default function Homepage() {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { sm: `${drawerWidth}px` },
          p: 3,
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="overview" element={<OverviewPage />} />
          <Route path="/emotions" element={<EmotionDetectionPage />} />
          <Route path="/cry-alerts" element={<CrySoundAlertsPage />} />
          <Route path="vitals" element={<VitalsMonitorPage />} />
          <Route path="ai-insights" element={<AIInsightsPage />} />
          <Route path="timeline" element={<ActivityTimelinePage />} />
          <Route path="trends" element={<HealthTrendsPage />} />
          <Route path="baby-profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </Box>
    </Box>
  );
}