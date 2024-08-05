import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import { useNavigate } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  loginContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing(8), // Adjust the margin top

  },
  paper: {
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "2%",
    width: "100%",
    marginTop: theme.spacing(8), // Adjust the margin top

  },
  form: {
    width: "100%", // Fix IE 11 issue.
    // marginTop: theme.spacing(1),
  },
  formElement: {
    marginBottom: theme.spacing(2),
  },
  appButton: {
    margin: theme.spacing(3, 0, 2),
  },
}));

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
          localStorage.setItem("user", JSON.stringify(data))
          // setTimeout(() => {
          //     navigate("/");
          // }, 2000);
          navigate("/");
        }
        else {
          localStorage.clear('');
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
      className={classes.registerContainer}
    >
      <Paper elevation={3} className={classes.paper}>
        <Grid container spacing={2}>
          {respMsg && <Grid item xs={12}>
            {(respMsg && error === false) && (
              <Alert
                onClose={handleCloseReportUserManagement}
                severity="success"
                style={{ marginBottom: "16px" }}
              >
                {respMsg}
              </Alert>
            )}
            {(respMsg && error === true) && (
              <Alert
                onClose={handleCloseReportUserManagement}
                severity="error"
                style={{ marginBottom: "16px" }}
              >
                {respMsg}
              </Alert>
            )}
          </Grid>}
          <Grid item xs={12}>
            <h1>Login</h1>
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    className={classes.appButton}
                    variant="outlined"
                    color="primary"
                    onClick={() => { }}
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
        <div className={classes.linkContainer}>
          <Typography variant="body2">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </Typography>
        </div>
      </Paper>
    </Container>
  );

};

export default LoginPage;
