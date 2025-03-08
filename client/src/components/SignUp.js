import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Container, Paper, Grid, TextField, Button, IconButton, InputAdornment, Typography, Alert } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

// Define styled components
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

const StyledFormElement = styled(Grid)(({ theme }) => ({
  // marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  // marginTop: theme.spacing(2),
}));

const YourComponent = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [respMsg, setRespMsg] = useState("");
  const [checkValidate, setCheckValidate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (auth) {
      navigate('/');
    }
  }, [navigate]);

  const RegisterUser = () => {
    setCheckValidate(true);
    // let emailValidate = validateEmail(email);
    // let mobileNumberValidate = validateMobileNo(mobile);
    if (firstName?.trim() && lastName?.trim() && username?.trim() && mobile.length === 10) {
      fetch("http://localhost:5000/users/register", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, mobile, username, password }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          setRespMsg(data?.msg);
          navigate('/login');
        });
      setCheckValidate(false);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/users/getAllUsers", {
      method: "get",
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
      });
  }, []);

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

  const handleCloseReportUserManagement = () => {
    setRespMsg("");
  };


  const validateEmail = (email) => {
    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (email && email.match(isValidEmail)) {
      return false
    } else {
      return true;
    }
  }
  const validateMobileNo = (no) => {
    return no?.trim()?.length === 10 && Number.isInteger(no) ? false : true;
  }

  return (
    <StyledContainer
      component="main"
      maxWidth="xs"
    >
      <StyledPaper elevation={3}>
        {respMsg && (
          <Alert
            onClose={handleCloseReportUserManagement}
            severity="success"
            sx={{ mb: 2 }}
          >
            {respMsg}
          </Alert>
        )}
        <Typography variant="h5" gutterBottom>Register</Typography>
        <form style={{ width: "100%" }}>
          <Grid container spacing={2}>
            <StyledFormElement item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                error={checkValidate ? firstName?.trim() ? false : true : false}
                value={firstName}
                onChange={(e) => { 
                  setFirstName(e.target.value);
                  setCheckValidate(false)
                 }}
              />
            </StyledFormElement>
            <StyledFormElement item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                error={checkValidate ? lastName?.trim() ? false : true : false}
                value={lastName}
                onChange={(e) => { setLastName(e.target.value);
                   setCheckValidate(false) }}
              />
            </StyledFormElement>
            <StyledFormElement item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                error={checkValidate ? validateEmail(email) : false}
                value={email}
                onChange={(e) => { setEmail(e.target.value);
                   setCheckValidate(false) }}
              />
            </StyledFormElement>
            <StyledFormElement item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number"
                variant="outlined"
                error={checkValidate ? validateMobileNo(mobile) : false}
                value={mobile}
                onChange={(e) => { setMobile(e.target.value);
                   setCheckValidate(false) }}
              />
            </StyledFormElement>
            <StyledFormElement item xs={12}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                error={checkValidate ? username?.trim() ? false : true : false}
                value={username}
                onChange={(e) => { setUsername(e.target.value);
                   setCheckValidate(false) }}
              />
            </StyledFormElement>
            <StyledFormElement item xs={12}>
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                error={checkValidate ? password?.trim() ? false : true : false}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => { setShowPassword(!showPassword);
                           setCheckValidate(false) }}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </StyledFormElement>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <StyledButton
                fullWidth
                variant="outlined"
                color="primary"
                onClick={clearForm}
              >
                Cancel
              </StyledButton>
            </Grid>
            <Grid item xs={6}>
              <StyledButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={RegisterUser}
              >
                Sign Up
              </StyledButton>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </StyledContainer>
  );
};

export default YourComponent;
