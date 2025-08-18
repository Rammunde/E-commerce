import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Alert from "@mui/material/Alert";

const NewUserCreation = ({ open, userData = {}, onResult = () => {} }) => {
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
  const [isValidateError, setIsValidateError] = useState(false);

  useEffect(() => {
    if (userData && Object.keys(userData).length !== 0) {
      setUserFirstName(userData?.firstName);
      setUserLastName(userData?.lastName);
      setUserName(userData?.username);
      setUserEmail(userData?.email);
      setPassword(userData?.password);
      setUserMobile(userData?.mobile);
      setEditingUserId(userData?._id);
    }
  }, [userData]);

  const handleOnClose = (action = "") => {
    if (action === "success") {
      setTimeout(() => {
        onResult(action, false);
        setUserFirstName("");
        setUserLastName("");
        setUserName("");
        setUserEmail("");
        setPassword("");
        setUserMobile("");
        setEditingUserId(0);
      }, 1500);
    }
  };

  const callApi = () => {
    if (editUserId === 0) {
      fetch("http://localhost:5000/users/register", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
          mobile: userMobile,
          username: userName,
          password,
        }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          setRespMsg(data.msg);
          setIsError(data.err);
          if (!data.err) {
            handleOnClose("success");
          }
        });
    } else {
      fetch("http://localhost:5000/users/editUser", {
        method: "post",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUserId,
          firstName: userFirstName,
          lastName: userLastName,
          username: userName,
          password: password,
          email: userEmail,
          mobile: userMobile,
        }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          setRespMsg(data.msg);
          setIsError(data.err);
          if (!data.err) {
            handleOnClose("success");
          }
        });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onResult("", false);
      }}
      PaperProps={{
        style: { width: "30rem", borderRadius: "0.5rem" },
      }}
    >
      <DialogTitle style={{ textAlign: "center" }} color={"#525861ff"}>
        {editUserId === 0 ? "Create New User" : "Edit User"}
      </DialogTitle>
      <DialogContent style={{ paddingTop: "0.5rem" }}>
        <Grid container spacing={2}>
          {respMsg && (
            <Grid item xs={12}>
              <Alert
                style={{ marginBottom: "0.5rem" }}
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
              type="number"
              inputProps={{ maxLength: 10 }}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 10) {
                  setUserMobile(value);
                  setIsUpdated(true);
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="UserName"
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
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        style={{
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
              onClick={() => {
                onResult("", false);
              }}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={
                editUserId !== 0
                  ? !(isUpdated && userMobile?.length === 10)
                  : userMobile?.length !== 10 ||
                    !userName ||
                    !password ||
                    !userFirstName ||
                    !userLastName ||
                    !userEmail
              }
              onClick={callApi}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
export default NewUserCreation;
