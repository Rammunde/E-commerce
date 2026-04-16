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

const SignUpPage = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [respMsg, setRespMsg] = useState("");
  const [error, setError] = useState(false);
  const [checkValidate, setCheckValidate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const auth = localStorage.getItem("user");
    if (auth) {
      navigate("/product");
    }
  }, [navigate]);

  // Validation helpers
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return email && emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateMobileNo = (no) => {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(no);
  };

  const isFormValid = () => {
    return (
      firstName?.trim() &&
      lastName?.trim() &&
      username?.trim() &&
      validatePassword(password) &&
      validateEmail(email) &&
      validateMobileNo(mobile)
    );
  };

  const registerUser = async (e) => {
    if (e) e.preventDefault();
    setCheckValidate(true);
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const response = await fetch("http://localhost:5000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          firstName,
          lastName,
          email,
          mobile,
          username,
          password,
        }),
      });
      const data = await response.json();

      setRespMsg(data?.msg);
      setError(false);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setRespMsg("Registration failed. Please try again.");
      setError(true);
    } finally {
      setIsLoading(false);
      setCheckValidate(false);
    }
  };

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setMobile("");
    setPassword("");
    setRespMsg("");
    setCheckValidate(false);
  };

  const handleCloseAlert = () => {
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
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
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
              Looks like you're new here!
            </Typography>
            <Typography variant="body2" sx={{ color: "#878787" }}>
              Please fill following information to signup
            </Typography>
          </Box>

          {respMsg && (
            <Alert
              onClose={handleCloseAlert}
              severity={error ? "error" : "success"}
              sx={{ width: "100%", mb: 3 }}
            >
              {respMsg}
            </Alert>
          )}

          <form style={{ width: "100%" }} onSubmit={registerUser}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="standard"
                  error={checkValidate && !firstName?.trim()}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  variant="standard"
                  error={checkValidate && !lastName?.trim()}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="standard"
                  error={checkValidate && !validateEmail(email)}
                  helperText={
                    checkValidate && !validateEmail(email) ? "Enter a valid email" : ""
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  variant="standard"
                  error={checkValidate && !validateMobileNo(mobile)}
                  helperText={
                    checkValidate && !validateMobileNo(mobile) ? "Enter a valid 10-digit number" : ""
                  }
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  inputProps={{ maxLength: 10 }}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="standard"
                  error={checkValidate && !username?.trim()}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="standard"
                  error={checkValidate && !validatePassword(password)}
                  helperText={
                    checkValidate && !validatePassword(password)
                      ? "Use 8+ chars (A, a, 1, #)"
                      : ""
                  }
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  sx={inputStyles}
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
                    mt: 2,
                    "&:hover": {
                      backgroundColor: "#f4511e",
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "CONTINUE"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    color: "#2874f0",
                    borderColor: "#e0e0e0",
                    fontWeight: 600,
                    borderRadius: "2px",
                    "&:hover": {
                      backgroundColor: "#fff",
                      borderColor: "#e0e0e0",
                      boxShadow: "0 2px 4px 0 rgba(0,0,0,.1)",
                    },
                  }}
                >
                  Existing User? Log in
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

const inputStyles = {
  "& .MuiInput-underline:after": { borderBottomColor: "#2874f0" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2874f0" },
};

export default SignUpPage;
