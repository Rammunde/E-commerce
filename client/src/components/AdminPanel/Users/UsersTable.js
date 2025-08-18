import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Paper,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Menu,
  MenuItem,
  IconButton,
  TextField,
  Fade,
  Modal,
  Tooltip,
  Alert,
  Pagination,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchField from "./SearchField";
import NewUserCreation from "./NewUserCreation";

const useStyles = makeStyles((theme) => ({
  layoutSetting: {
    marginTop: "2rem"
  },
}));

const table = { width: "100%" };
const tableHeaderCell = {
  backgroundColor: "#e5e7f2",
  fontWeight: "bold",
  position: "sticky",
  top: 0,
  zIndex: 1,
};
const paper = { padding: "10px" };
const modal = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const modalContent = {
  backgroundColor: "#fff",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "16px 16px 24px 16px",
  width: "400px",
};

const UsersTable = () => {
  const classes = useStyles();

  const initialSearchRender = useRef(true);
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("***********");
  const [userEmail, setUserEmail] = useState("");
  const [editUserId, setEditingUserId] = useState(0);
  const [userMobile, setUserMobile] = useState("");
  const [respMsgOnEdit, setRespMsgOnEdit] = useState("");
  const [error, setError] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [nameList, setNameList] = useState([]);
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({});

  console.log("searchString", searchString);
  const getAllUserList = () => {
    fetch("http://localhost:5000/users/getAllAvailableUsers", {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        searchString: searchString,
        sortBy: "name",
        sortOrder: "asc",
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setUsers(data?.data);
        setTotalCount(data?.totalCount);
        const names = data.data.map((record) => record.name);
        setNameList(names);
      });
  };

  useEffect(() => {
    if (initialSearchRender.current) {
      initialSearchRender.current = false;
    } else {
      console.log("called");
      getAllUserList();
    }
  }, [searchString]);

  useEffect(() => {
    getAllUserList();
  }, []);

  const handleUserMenuClick = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };

  const handleEditUser = (user) => {
    setUserData(user);
    setOpen(true);
    setUserFirstName(user?.firstName);
    setUserLastName(user?.lastName);
    setUserName(user?.username);
    setUserEmail(user?.email);
    setPassword(user?.password);
    setUserMobile(user?.mobile);
    setEditingUserId(user?._id);
    setOpenUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    fetch(`http://localhost:5000/users/deleteUser/${userId}`, {
      method: "DELETE",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then(() => {
        getAllUserList();
      });
  };

  const handleCloseUserModal = () => {
    setAnchorEl(null);
    setOpenUserModal(false);
  };

  const saveEditUser = () => {
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
        getAllUserList();
        setError(false);
        setRespMsgOnEdit(data?.msg);
        if (!data?.err) {
          setTimeout(() => {
            setRespMsgOnEdit("");
            setError(false);
            setOpenUserModal(false);
          }, 1000);
        }
      });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleClose = () => {
    setRespMsgOnEdit("");
    setError(false);
  };

  const handleOnClose = () => {
    setOpen(false);
  };

  return (
    <Container component="main" maxWidth="md" className={classes.layoutSetting}>
      {open && (
        <NewUserCreation
          open={open}
          userData={userData}
          onResult={(action, boolean) => {
            if (action === "success") {
              getAllUserList();
            }
            setOpen(boolean);
          }}
        />
      )}
      <Grid style={{ paddingBottom: "2rem" }}>
        <Typography variant="h6" color={"#525861ff"}>
          {" "}
          Users List (
          <span style={{ color: "#969ca5ff" }}>{totalCount} Users</span>)
        </Typography>
      </Grid>
      <Grid
        style={{
          paddingBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <SearchField
          label={"Search by name"}
          setSearchString={setSearchString}
          namesList={nameList}
        />

        <Grid style={{ marginTop: "0.5rem" }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            style={{ width: "10rem", height: "2.5rem", marginRight: "0.5rem" }}
            onClick={() => {
              setOpen(true);
              setUserData({});
            }}
          >
            Add New User
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            style={{ width: "10rem", height: "2.5rem" }}
            // onClick={}
          >
            Export
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={3} style={{ padding: "1rem", borderRadius: "0.5rem" }}>
        <TableContainer style={{ maxHeight: 500, overflow: "auto" }}>
          <Table style={table} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell style={tableHeaderCell}>Name</TableCell>
                <TableCell style={tableHeaderCell}>User-Name</TableCell>
                <TableCell style={tableHeaderCell}>Mobile</TableCell>
                <TableCell style={tableHeaderCell}>Email</TableCell>
                <TableCell align="right" style={tableHeaderCell}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                ?.slice(
                  (page - 1) * rowsPerPage,
                  (page - 1) * rowsPerPage + rowsPerPage
                )
                .map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.firstName + " " + user.lastName}
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleUserMenuClick(e, user?._id)} color="primary"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && currentUserId === user?._id}
                        onClose={() => setAnchorEl(null)}
                      >
                        <MenuItem
                          onClick={() => {
                            handleEditUser(user);
                            setAnchorEl(null);
                          }}
                        >
                          <Tooltip title="Edit">
                            <EditIcon color="primary" />
                          </Tooltip>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleDeleteUser(user?._id);
                            setAnchorEl(null);
                          }}
                        >
                          <Tooltip title="Delete">
                            <DeleteIcon color="primary" />
                          </Tooltip>
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Grid
          container
          justifyContent="flex-end"
          style={{ marginTop: "16px", paddingBottom: "16px" }}
        >
          <Pagination
            count={Math.ceil(users.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Grid>
      </Paper>

      {/* Edit User Modal */}
      {/* <Modal style={modal} open={openUserModal} onClose={handleCloseUserModal}>
        <Fade in={openUserModal}>
          <div style={modalContent}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {respMsgOnEdit && (
                  <Alert
                    onClose={handleClose}
                    severity={error ? "error" : "success"}
                    style={{ marginBottom: "16px" }}
                  >
                    {respMsgOnEdit}
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12}>
                <h1>Edit User</h1>
                <form>
                  <Paper elevation={4} style={paper}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          variant="outlined"
                          value={userFirstName}
                          onChange={(e) => setUserFirstName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          variant="outlined"
                          value={userLastName}
                          onChange={(e) => setUserLastName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mobile Number"
                          variant="outlined"
                          value={userMobile}
                          type="number"
                          inputProps={{ maxLength: 10 }}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 10) {
                              setUserMobile(value);
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="UserName"
                          variant="outlined"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Password"
                          variant="outlined"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          variant="outlined"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} style={{ paddingTop: "10px" }}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={handleCloseUserModal}
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
                            userMobile?.length !== 10 ||
                            !userName ||
                            !password ||
                            !userFirstName ||
                            !userLastName ||
                            !userEmail
                          }
                          onClick={saveEditUser}
                        >
                          Save
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </form>
              </Grid>
            </Grid>
          </div>
        </Fade>
      </Modal> */}
    </Container>
  );
};

export default UsersTable;
