import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link } from "react-router-dom";
import { useLoginUserMutation } from "../redux/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/appSlice";
import { PORTAL_NAME } from "../config";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [respMsg, setRespMsg] = useState("");
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const userFromStore = useSelector((state) => state.app.user);

  // Redirect if already logged in
  useEffect(() => {
    if (userFromStore && (userFromStore.data || userFromStore._id)) {
      const role = userFromStore.data?.role || userFromStore.role;
      navigate(role === "Admin" ? "/user-management" : "/product");
    }
  }, [navigate, userFromStore]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setRespMsg("Please enter both username and password");
      return;
    }

    try {
      const result = await loginUser({ username, password }).unwrap();
      if (result) {
        dispatch(setUser(result));
        setRespMsg("Login successful!");
        const isAdmin = result?.data?.role === "Admin";
        setTimeout(() => navigate(isAdmin ? "/user-management" : "/product"), 1000);
      }
    } catch (err) {
      setRespMsg(err?.data?.msg || "Login failed. Please try again.");
    }
  };

  const clearForm = () => {
    setUsername("");
    setPassword("");
    setRespMsg("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f3f6",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={1}
          sx={{
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: "4px",
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ width: "100%", textAlign: "left", mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#212121", mb: 1 }}>
              Login
            </Typography>
            <Typography variant="body2" sx={{ color: "#878787" }}>
              Get access to your Orders, Wishlist and Recommendations
            </Typography>
          </Box>

          {respMsg && (
            <Alert
              severity={respMsg.toLowerCase().includes("failed") ? "error" : "success"}
              sx={{ width: "100%", mb: 3 }}
            >
              {respMsg}
            </Alert>
          )}

          <form style={{ width: "100%" }} onSubmit={handleLogin}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Enter Username"
                  variant="standard"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#2874f0" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#2874f0" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Enter Password"
                  variant="standard"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#2874f0" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#2874f0" },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: "#878787", fontSize: "12px", mb: 2 }}>
                  By continuing, you agree to {PORTAL_NAME}'s Terms of Use and Privacy Policy.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    backgroundColor: "#fb641b",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: "2px",
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,.2)",
                    "&:hover": {
                      backgroundColor: "#f4511e",
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 4, width: "100%", textAlign: "center" }}>
            <Link
              to="/signup"
              style={{
                color: "#2874f0",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              New to {PORTAL_NAME}? Create an account
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
