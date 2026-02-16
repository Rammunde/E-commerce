import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material";
import Alert from "@mui/material/Alert";

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Email validation helper
const validateEmail = (email) => {
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
};

const NewUserCreation = ({ open, userData = {}, onResult = () => { } }) => {
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editUserId, setEditingUserId] = useState(0);
  const [userMobile, setUserMobile] = useState("");
  const [respMsg, setRespMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = editUserId !== 0;

  useEffect(() => {
    if (userData && Object.keys(userData).length !== 0) {
      setUserFirstName(userData?.firstName || "");
      setUserLastName(userData?.lastName || "");
      setUserName(userData?.username || "");
      setUserEmail(userData?.email || "");
      setPassword(userData?.password || "");
      setUserMobile(userData?.mobile || "");
      setEditingUserId(userData?._id || 0);
    }
  }, [userData]);

  const resetForm = () => {
    setUserFirstName("");
    setUserLastName("");
    setUserName("");
    setUserEmail("");
    setPassword("");
    setUserMobile("");
    setEditingUserId(0);
    setRespMsg("");
    setIsUpdated(false);
  };

  const handleOnClose = (action = "") => {
    if (action === "success") {
      setTimeout(() => {
        onResult(action, false);
        resetForm();
      }, 1500);
    }
  };

  const isFormValid = () => {
    if (isEditMode) {
      return isUpdated && userMobile?.length === 10;
    }
    return (
      userFirstName?.trim() &&
      userLastName?.trim() &&
      userName?.trim() &&
      password?.trim() &&
      validateEmail(userEmail) &&
      userMobile?.length === 10
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setRespMsg("");

    const fullName = `${userFirstName} ${userLastName}`;
    const payload = {
      fullName,
      firstName: userFirstName,
      lastName: userLastName,
      email: userEmail,
      mobile: userMobile,
      username: userName,
      password,
    };

    try {
      let response;
      if (isEditMode) {
        response = await fetch(`${API_BASE_URL}/users/editUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, userId: editUserId }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      setRespMsg(data.msg);
      setIsError(data.err);

      if (!data.err) {
        handleOnClose("success");
      }
    } catch (error) {
      setRespMsg("An error occurred. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onResult("", false);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { width: "30rem", borderRadius: "0.5rem" },
      }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="primary">
          {isEditMode ? "Edit User Details" : "Create New User"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ paddingTop: "0.5rem" }}>
        <Grid container spacing={2}>
          {respMsg && (
            <Grid item xs={12}>
              <Alert
                sx={{ marginBottom: "0.5rem" }}
                variant="outlined"
                severity={isError ? "error" : "success"}
              >
                {respMsg}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={userFirstName}
                  onChange={(e) => {
                    setUserFirstName(e.target.value);
                    setIsUpdated(true);
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={userLastName}
                  onChange={(e) => {
                    setUserLastName(e.target.value);
                    setIsUpdated(true);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mobile Number"
              value={userMobile}
              inputProps={{ maxLength: 10 }}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 10) {
                  setUserMobile(value);
                  setIsUpdated(true);
                }
              }}
              error={userMobile.length > 0 && userMobile.length !== 10}
              helperText={
                userMobile.length > 0 && userMobile.length !== 10
                  ? "Enter 10-digit number"
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setIsUpdated(true);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setIsUpdated(true);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
                setIsUpdated(true);
              }}
              error={userEmail.length > 0 && !validateEmail(userEmail)}
              helperText={
                userEmail.length > 0 && !validateEmail(userEmail)
                  ? "Enter a valid email"
                  : ""
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingBottom: "1rem",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              color="primary"
              variant="outlined"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={!isFormValid() || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserCreation;
