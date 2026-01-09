import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppleIcon from "@mui/icons-material/Apple";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import image from "../../Assets/baby.svg";
import { auth, persistence, appleProvider } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
} from "firebase/auth";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const applyPersistence = async () => {
    await setPersistence(
      auth,
      rememberMe
        ? persistence.browserLocalPersistence
        : persistence.browserSessionPersistence
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await applyPersistence();
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await applyPersistence();
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/home", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAppleSignup = async () => {
    try {
      await applyPersistence();
      await signInWithPopup(auth, appleProvider);
      navigate("/home", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const InputField = ({ icon, label, placeholder, type, value, onChange }) => (
    <Box mb={2}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        {icon}
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
      </Box>
      <TextField
        placeholder={placeholder}
        type={type}
        fullWidth
        variant="outlined"
        value={value}
        onChange={onChange}
        required
      />
    </Box>
  );

  return (
    <Box className="container" sx={{ p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box className="cardContainer" sx={{ maxWidth: 360, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={image} alt="baby icon" style={{ width: 50, height: 50 }} />
            <Typography variant="h4" sx={{ m: 0, lineHeight: 1 }}>Nurtura ONE</Typography>
          </Box>

          <Typography variant="subtitle1" sx={{ textAlign: "center", opacity: 0.6 }}>
            Advanced baby monitoring system with <br /> AI-powered health insights
          </Typography>

          <Box className="formCard" sx={{ p: 4, borderRadius: 2, boxShadow: 3, bgcolor: "#fff" }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: "bold", mb: 2 }}>
              Sign Up
            </Typography>

            <form onSubmit={handleSignup}>
              <InputField
                icon={<PersonIcon color="action" />}
                label="Name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <InputField
                icon={<EmailIcon color="action" />}
                label="Email"
                placeholder="parent@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField
                icon={<LockIcon color="action" />}
                label="Password"
                placeholder="******"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label="Remember me"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: "#ff7043",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#e64a19" },
                }}
              >
                Create Account
              </Button>

              <Typography align="center" sx={{ mt: 2, mb: 1, color: "#666" }}>
                Already have an account?{" "}
                <span style={{ cursor: "pointer", fontWeight: "bold", color: "#1976d2" }} onClick={() => navigate("/")}>
                  Login
                </span>
              </Typography>

              <Typography align="center" sx={{ my: 1, color: "#666" }}>Or continue with</Typography>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleGoogleSignup}
                  startIcon={<img src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png" alt="Google" style={{ width: 20, height: 20 }} />}
                  sx={{
                    textTransform: "none",
                    borderColor: "#4285F4",
                    color: "#4285F4",
                    "&:hover": { bgcolor: "rgba(66,133,244,0.1)", borderColor: "#4285F4" },
                  }}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleAppleSignup}
                  startIcon={<AppleIcon />}
                  sx={{
                    textTransform: "none",
                    borderColor: "#000",
                    color: "#000",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.1)", borderColor: "#000" },
                  }}
                >
                  Apple
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Signup;
