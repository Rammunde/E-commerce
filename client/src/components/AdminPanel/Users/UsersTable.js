import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Tooltip,
  Pagination,
  Typography,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchField from "./SearchField";
import NewUserCreation from "./NewUserCreation";

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Styles
const styles = {
  tableHeaderCell: {
    backgroundColor: "#e5e7f2",
    fontWeight: "bold",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
};

const UsersTable = () => {
  const initialSearchRender = useRef(true);
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [nameList, setNameList] = useState([]);
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const getAllUserList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/getAllAvailableUsers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchString,
          limit: 10,
          offset: 0,
          sortBy: "name",
          sortOrder: "asc",
        }),
      });
      const data = await response.json();
      setUsers(data?.data || []);
      setTotalCount(data?.totalCount || 0);
      const names = data?.data?.map((record) => record.name) || [];
      setNameList(names);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch users",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchString]);

  useEffect(() => {
    if (initialSearchRender.current) {
      initialSearchRender.current = false;
    } else {
      getAllUserList();
    }
  }, [searchString, getAllUserList]);

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
  };

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`${API_BASE_URL}/users/deleteUser/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setSnackbar({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
      getAllUserList();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete user",
        severity: "error",
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/getAllUserToExport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchString,
          sortBy: "name",
          sortOrder: "asc",
        }),
      });
      const data = await response.json();

      if (!data?.data?.length) {
        setSnackbar({
          open: true,
          message: "No data to export",
          severity: "warning",
        });
        return;
      }

      // Generate CSV
      const headers = Object.keys(data.data[0]);
      const csvHeaders = headers.join(",");
      const csvRows = data.data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      );
      const csvContent = [csvHeaders, ...csvRows].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "Export successful",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Export failed",
        severity: "error",
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container component="main" maxWidth="md" sx={{ marginTop: "2rem" }}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

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

      <Grid sx={{ paddingBottom: "2rem" }}>
        <Typography variant="h6" color="#525861">
          Users List (
          <span style={{ color: "#969ca5" }}>{totalCount} Users</span>)
        </Typography>
      </Grid>

      <Grid
        sx={{
          paddingBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <SearchField
          label="Search by name"
          setSearchString={setSearchString}
          namesList={nameList}
        />

        <Grid sx={{ marginTop: "0.5rem" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "10rem", height: "2.5rem", marginRight: "0.5rem" }}
            onClick={() => {
              setOpen(true);
              setUserData({});
            }}
          >
            Add New User
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "10rem", height: "2.5rem" }}
            onClick={handleExport}
          >
            Export
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ padding: "1rem", borderRadius: "0.5rem" }}>
        <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
          <Table sx={{ width: "100%" }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell sx={styles.tableHeaderCell}>Name</TableCell>
                <TableCell sx={styles.tableHeaderCell}>User-Name</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Mobile</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Email</TableCell>
                <TableCell align="right" sx={styles.tableHeaderCell}>
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
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleUserMenuClick(e, user?._id)}
                        color="primary"
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
          sx={{ marginTop: "16px", paddingBottom: "16px" }}
        >
          <Pagination
            count={Math.ceil((users?.length || 0) / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Grid>
      </Paper>
    </Container>
  );
};

export default UsersTable;
