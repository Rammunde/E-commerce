import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Container, Paper, Grid, TextField, Button, IconButton, InputAdornment } from "@mui/material";
import Alert from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";


const useStyles = styled((theme) => ({
  registerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: "2%",
    width: "100%"
  },
  formElement: {
    marginBottom: theme.spacing(2),
  },
  appButton: {
    marginTop: theme.spacing(2),
  },
}));

const YourComponent = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState(null);
  const [password, setPassword] = useState("");
  const [respMsg, setRespMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (auth) {
      navigate('/');
    }
  }, [navigate]);

  const RegisterUser = () => {
    fetch("http://localhost:5000/users/register", {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, mobile, username, password }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setRespMsg(data?.msg);
        // localStorage.setItem("user",JSON.stringify(data));
        navigate('/login');
      });
  };

  useEffect(() => {
    fetch("http://localhost:5000/users/getAllUsers", {
      method: "get",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        // setRespMsg(data?.msg);
      });
  }, []);

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setMobile(null);
    setPassword("");
    setRespMsg("");
  };

  const handleCloseReportUserManagement = () => {
    setRespMsg("");
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      className={classes.registerContainer}
    >
      <Paper elevation={3} className={classes.paper}>
        <Grid container spacing={2}>
          {respMsg && <Grid item xs={12}>
            {respMsg && (
              <Alert
                onClose={handleCloseReportUserManagement}
                severity="success"
                style={{ marginBottom: "16px" }}
              >
                {respMsg}
              </Alert>
            )}
          </Grid>}
          <Grid item xs={12}>
            <h1>Register</h1>
            <form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    variant="outlined"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    className={classes.appButton}
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
                    className={classes.appButton}
                    variant="contained"
                    color="primary"
                    onClick={RegisterUser}
                  >
                    Sign Up
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default YourComponent;
