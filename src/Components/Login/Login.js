import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AppleIcon from "@mui/icons-material/Apple";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import image from "../../Assets/baby.svg";
import { auth, persistence, appleProvider } from "../../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [resetDialog, setResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const applyPersistence = async () => {
    await setPersistence(
      auth,
      rememberMe
        ? persistence.browserLocalPersistence
        : persistence.browserSessionPersistence
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await applyPersistence();
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await applyPersistence();
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/home/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAppleLogin = async () => {
    setError("");
    try {
      await applyPersistence();
      await signInWithPopup(auth, appleProvider);
      navigate("/home/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetDialog(false);
      setResetEmail("");
      alert("Password reset email sent.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box sx={{ width: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={image} alt="baby icon" style={{ width: 50, height: 50 }} />
            <Typography variant="h4" sx={{ m: 0, lineHeight: 1 }}>Nurtura ONE</Typography>
          </Box>

          <Typography variant="subtitle1" sx={{ textAlign: "center", opacity: 0.6 }}>
            Advanced baby monitoring system with <br /> AI-powered health insights
          </Typography>

          <Box sx={{ mt: 1, p: 4, borderRadius: 2, boxShadow: 3, width: "100%", bgcolor: "#fff" }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: "bold", mb: 2 }}>
              Login
            </Typography>

            {error && (
              <Typography color="error" align="center" sx={{ mb: 2, fontSize: "0.9rem" }}>
                {error}
              </Typography>
            )}

            <form onSubmit={handleLogin}>
              <Box mb={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <EmailIcon color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Email</Typography>
                </Box>
                <TextField
                  placeholder="parent@gmail.com"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Box>

              <Box mb={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <LockIcon color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Password</Typography>
                </Box>
                <TextField
                  placeholder="******"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                  label="Remember me"
                />
                <Typography sx={{ cursor: "pointer", color: "#1976d2", fontWeight: "bold" }} onClick={() => setResetDialog(true)}>
                  Forgot password?
                </Typography>
              </Box>

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
                  boxShadow: "0 4px 10px rgba(255,112,67,0.3)",
                  "&:hover": { bgcolor: "#e64a19", boxShadow: "0 6px 14px rgba(230,74,25,0.4)" },
                }}
              >
                Login
              </Button>

              <Typography align="center" sx={{ mt: 2, mb: 1, color: "#666" }}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ fontWeight: "bold", color: "#1976d2", textDecoration: "underline" }}>
                  Sign Up
                </Link>
              </Typography>

              <Typography align="center" sx={{ my: 1, color: "#666" }}>Or continue with</Typography>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleGoogleLogin}
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
                  onClick={handleAppleLogin}
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

      <Dialog open={resetDialog} onClose={() => setResetDialog(false)} PaperProps={{ sx: { borderRadius: 2, p: 2, width: 360 } }}>
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, fontSize: "0.9rem", color: "#555" }}>
            Enter your email address and we’ll send you a link to reset your password.
          </Typography>
          <TextField
            placeholder="parent@gmail.com"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
          <Button onClick={() => setResetDialog(false)} sx={{ textTransform: "none", color: "#666" }}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" sx={{ bgcolor: "#ff7043", textTransform: "none", "&:hover": { bgcolor: "#e64a19" } }}>
            Send Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
