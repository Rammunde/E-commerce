import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
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
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link } from "react-router-dom";

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(8),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 8,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

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
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return email && emailRegex.test(email);
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
      password?.trim() &&
      validateEmail(email) &&
      validateMobileNo(mobile)
    );
  };

  const registerUser = async () => {
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
      navigate("/login");
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
    <StyledContainer component="main" maxWidth="xs">
      <StyledPaper elevation={3}>
        {respMsg && (
          <Alert
            onClose={handleCloseAlert}
            severity={error ? "error" : "success"}
            sx={{ mb: 2, width: "100%" }}
          >
            {respMsg}
          </Alert>
        )}
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>
        <form style={{ width: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                error={checkValidate && !firstName?.trim()}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                error={checkValidate && !lastName?.trim()}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                error={checkValidate && !validateEmail(email)}
                helperText={
                  checkValidate && !validateEmail(email)
                    ? "Enter a valid email"
                    : ""
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number"
                variant="outlined"
                error={checkValidate && !validateMobileNo(mobile)}
                helperText={
                  checkValidate && !validateMobileNo(mobile)
                    ? "Enter a valid 10-digit number"
                    : ""
                }
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                error={checkValidate && !username?.trim()}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                error={checkValidate && !password?.trim()}
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
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={clearForm}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={registerUser}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Sign Up"}
              </Button>
            </Grid>
          </Grid>
        </form>
        <div style={{ paddingTop: "20px", textAlign: "center" }}>
          <Typography variant="body2">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </div>
      </StyledPaper>
    </StyledContainer>
  );
};

export default SignUpPage;
