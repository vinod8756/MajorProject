import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TimelineIcon from "@mui/icons-material/Timeline";
import { FiLogOut } from "react-icons/fi";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import image from "../../Assets/baby.svg";

export const drawerWidth = 260;
const brandColor = "#ff7043";

const menuSections = [
  {
    title: "Monitoring",
    items: [
      { text: "Overview", icon: <DashboardIcon />, path: "/home/overview" },
      { text: "Vitals Monitor", icon: <FavoriteIcon />, path: "/home/vitals" },
      { text: "Emotion Detection", icon: <PsychologyIcon />, path: "/home/emotions" },
      { text: "Cry & Sound Alerts", icon: <NotificationsActiveIcon />, path: "/home/cry-alerts" },
    ],
  },
  {
    title: "Insights",
    items: [
      { text: "Health Trends", icon: <BarChartIcon />, path: "/home/trends" },
      { text: "AI Insights", icon: <PsychologyIcon />, path: "/home/ai-insights" },
      { text: "Activity Timeline", icon: <TimelineIcon />, path: "/home/timeline" },
    ],
  },
  {
    title: "Management",
    items: [
      { text: "Baby Profile", icon: <ChildCareIcon />, path: "/home/baby-profile" },
      { text: "Alert Rules", icon: <FavoriteBorderIcon />, path: "/home/alerts" },
    ],
  },
  {
    title: "System",
    items: [
      { text: "Device & Settings", icon: <SettingsIcon />, path: "/home/settings" },
    ],
  },
];

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [name, setName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setName(user.displayName || user.email.split("@")[0]);
      else setName("");
    });
    return () => unsub();
  }, []);

  const toggleDrawer = () => setMobileOpen((p) => !p);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const pageTitle =
    menuSections.flatMap((s) => s.items).find((i) => i.path === currentPath)?.text ||
    "Overview";

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar sx={{ gap: 1, px: 2 }}>
        <img src={image} alt="Nurtura ONE" style={{ width: 40, height: 40 }} />
        <Typography variant="h6" fontWeight={700} color={brandColor}>
          Nurtura ONE
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1, flexGrow: 1 }}>
        {menuSections.map((section) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            <Typography
              sx={{
                px: 2,
                py: 1,
                fontSize: 12,
                fontWeight: 700,
                color: "gray",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </Typography>

            {section.items.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={currentPath === item.path}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    "&.Mui-selected": {
                      backgroundColor: brandColor,
                      color: "#fff",
                      "& .MuiListItemIcon-root": { color: "#fff" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: brandColor }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#4f46e5",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              mr: 1,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Box>
          <Box>
            <Typography fontWeight={600}>{name}</Typography>
            <Typography fontSize={12} color="gray">
              Primary Caregiver
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={handleLogout} sx={{ color: "#ef4444" }}>
          <FiLogOut size={20} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          background: "#fff",
          color: brandColor,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: "none",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={600}>
            {pageTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
