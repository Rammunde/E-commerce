import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/appSlice";
import { useLoginUserMutation } from "../redux/apiSlice";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [respMsg, setRespMsg] = useState("");
  const [checkValidate, setCheckValidate] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async () => {
    setCheckValidate(true);
    if (!username?.trim() || !password) return;

    try {
      const data = await loginUser({ username, password }).unwrap();

      if (data.err === false) {
        setRespMsg(data?.msg);
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("userId", data?.data?._id);

        // Update Redux User State to trigger Nav update
        dispatch(setUser(data));

        // Navigate based on role
        navigate(data?.data?.role === "Admin" ? "/user-management" : "/product");
      } else {
        setRespMsg(data?.msg || "Login failed");
        localStorage.clear();
      }
    } catch (err) {
      setRespMsg(err?.data?.msg || "Failed to login. Please try again.");
    } finally {
      setCheckValidate(false);
    }
  };

  const handleCloseAlert = () => {
    setRespMsg("");
  };

  const handleClearForm = () => {
    setUsername("");
    setPassword("");
    setCheckValidate(false);
    setRespMsg("");
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 8,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 2,
          width: "100%",
          marginTop: 8,
        }}
      >
        <Grid container spacing={2}>
          {respMsg && (
            <Grid item xs={12}>
              <Alert
                onClose={handleCloseAlert}
                severity={respMsg.includes("failed") || respMsg.includes("Failed") ? "error" : "success"}
                sx={{ marginBottom: 2 }}
              >
                {respMsg}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="h5">Login</Typography>
            <form style={{ width: "100%", marginBottom: 16 }} onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    error={checkValidate && !username?.trim()}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    name="username"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    error={checkValidate && !password}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="off"
                    name="password"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ paddingTop: "20px" }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={handleClearForm}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : "Log In"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
        <div style={{ paddingTop: "20px", textAlign: "center" }}>
          <Typography variant="body2">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </Typography>
        </div>
      </Paper>
    </Container>
  );
};

export default LoginPage;

