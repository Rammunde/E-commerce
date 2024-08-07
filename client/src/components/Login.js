import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { TextField, Button, Paper, Container, Grid, IconButton, InputAdornment, Typography, Alert } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link } from "react-router-dom";

// Define styles using MUI v5 styled API
const useStyles = styled({
  loginContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 64, // Adjust the margin top as needed
  },
  paper: {
    padding: "32px 24px", // Add padding to all sides
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 8,
    width: "100%",
    marginTop: 64, // Adjust the margin top as needed
  },
  form: {
    width: "100%", // Fix IE 11 issue
    // padding: "0 16px", // Add padding to left and right
    // paddingTop:"30px",
    marginBottom: 16, // Add margin at the bottom
  },
  formElement: {
    marginBottom: 16,
  },
  appButton: {
    margin: "16px",
  },
  linkContainer: {
    marginTop: 20,
    textAlign: "center",
  },
});

const LoginPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [respMsg, setRespMsg] = useState("");
  const [error, setError] = useState(false);

  const navigateToSignUp = () => {
    navigate("/signup");
  };

  const loginUser = () => {
    fetch("http://localhost:5000/users/loginUser", {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setRespMsg(data?.msg);
        setError(data.err);
        if (data.err === false) {
          localStorage.setItem("user", JSON.stringify(data));
          navigate("/");
        } else {
          localStorage.clear();
        }
      });
  };

  const handleCloseReportUserManagement = () => {
    setRespMsg("");
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}
    >
      <Paper elevation={3} sx={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 2, width: "100%", marginTop: 8 }}>
        <Grid container spacing={2}>
          {respMsg && (
            <Grid item xs={12}>
              {respMsg && !error && (
                <Alert
                  onClose={handleCloseReportUserManagement}
                  severity="success"
                  sx={{ marginBottom: 2 }}
                >
                  {respMsg}
                </Alert>
              )}
              {respMsg && error && (
                <Alert
                  onClose={handleCloseReportUserManagement}
                  severity="error"
                  sx={{ marginBottom: 2 }}
                >
                  {respMsg}
                </Alert>
              )}
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="h5">Login</Typography>
            <form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    name="username"
                  />
                </Grid>
                <Grid item xs={12} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
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
                      )
                    }}
                    autoComplete="off"
                    name="password"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} style={{paddingTop:"20px"}}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    className={classes.appButton}
                    variant="outlined"
                    color="primary"
                    onClick={() => {}}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    className={classes.appButton}
                    variant="contained"
                    color="primary"
                    onClick={loginUser}
                  >
                    Log In
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
        <div className={classes.linkContainer} style={{paddingTop:"20px"}}>
          <Typography variant="body2">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </Typography>
        </div>
      </Paper>
    </Container>
  );
};

export default LoginPage;
