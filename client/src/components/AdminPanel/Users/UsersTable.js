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
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import SearchField from "./SearchField";
import NewUserCreation from "./NewUserCreation";

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Styles
const styles = {
  tableHeaderCell: {
    backgroundColor: "#f8f9fa",
    color: "#2874f0",
    fontWeight: "bold",
    borderBottom: "2px solid #e0e0e0",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  actionButton: {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '4px',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  }
};

const UsersTable = () => {
  const initialSearchRender = useRef(true);
  const fileInputRef = useRef(null);
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
          limit: rowsPerPage,
          offset: (page - 1) * rowsPerPage,
          sortBy: "name",
          sortOrder: "asc",
        }),
      });
      const data = await response.json();
      setUsers(data?.data || []);
      setTotalCount(data?.totalCount || 0);
      const names = data?.data?.map((record) => `${record.firstName} ${record.lastName}`) || [];
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
  }, [searchString, page, rowsPerPage]);

  useEffect(() => {
    getAllUserList();
  }, [getAllUserList]);

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

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));

      const firstNameIdx = headers.findIndex(h => h.toLowerCase() === 'first name' || h.toLowerCase() === 'firstname');
      const lastNameIdx = headers.findIndex(h => h.toLowerCase() === 'last name' || h.toLowerCase() === 'lastname');
      const mobileIdx = headers.findIndex(h => h.toLowerCase() === 'mobile no' || h.toLowerCase() === 'mobile');
      const usernameIdx = headers.findIndex(h => h.toLowerCase() === 'user name' || h.toLowerCase() === 'username');
      const emailIdx = headers.findIndex(h => h.toLowerCase() === 'email');
      const roleIdx = headers.findIndex(h => h.toLowerCase() === 'role');

      if (firstNameIdx === -1 || lastNameIdx === -1 || mobileIdx === -1) {
        setSnackbar({
          open: true,
          message: "CSV must contain columns: First Name, Last Name, Mobile No",
          severity: "error",
        });
        return;
      }

      const usersData = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = lines[i].split(",").map(c => c.trim().replace(/"/g, ''));
        if (columns.length < headers.length) continue;

        usersData.push({
          firstName: columns[firstNameIdx],
          lastName: columns[lastNameIdx],
          mobile: columns[mobileIdx],
          username: usernameIdx !== -1 ? columns[usernameIdx] : undefined,
          email: emailIdx !== -1 ? columns[emailIdx] : undefined,
          role: roleIdx !== -1 ? columns[roleIdx] : undefined
        });
      }

      if (usersData.length === 0) {
        setSnackbar({
          open: true,
          message: "No user data found in CSV",
          severity: "warning",
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/bulkUploadUsers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usersData }),
        });
        const data = await response.json();

        setSnackbar({
          open: true,
          message: data.msg,
          severity: data.err ? "error" : "success",
        });

        if (!data.err) {
          getAllUserList();
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to upload users",
          severity: "error",
        });
      } finally {
        setIsLoading(true);
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    event.target.value = "";
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ bgcolor: '#f1f3f6', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
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
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ borderRadius: '8px', boxShadow: 3 }}>
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

        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121' }}>
                User Management
                <Typography component="span" variant="body1" sx={{ ml: 1.5, color: '#878787' }}>
                  ({totalCount} Total)
                </Typography>
              </Typography>
            </Grid>
            <Grid item sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon fontSize="small" />}
                sx={styles.actionButton}
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
                sx={styles.actionButton}
                onClick={handleExport}
              >
                Export CSV
              </Button>
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                color="primary"
                sx={styles.actionButton}
                onClick={handleUploadClick}
              >
                Upload CSV
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <SearchField
            label="Search users by name..."
            setSearchString={(val) => {
              setSearchString(val);
              setPage(1);
            }}
            namesList={nameList}
          />
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeaderCell}>NAME</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>USERNAME</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>MOBILE</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>EMAIL</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>ROLE</TableCell>
                  <TableCell align="right" sx={styles.tableHeaderCell}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.mobile}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || 'User'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleUserMenuClick(e, user?._id)}
                          sx={{ color: '#2874f0' }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && currentUserId === user?._id}
                          onClose={() => setAnchorEl(null)}
                          PaperProps={{
                            elevation: 2,
                            sx: { borderRadius: '8px', minWidth: '120px' }
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              handleEditUser(user);
                              setAnchorEl(null);
                            }}
                          >
                            <EditIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                            Edit
                          </MenuItem>
                          <Tooltip title={user.hasCartData ? "This user has some data in cart" : ""} placement="left">
                            <span>
                              <MenuItem
                                disabled={user.hasCartData}
                                onClick={() => {
                                  handleDeleteUser(user?._id);
                                  setAnchorEl(null);
                                }}
                              >
                                <DeleteIcon fontSize="small" color={user.hasCartData ? "disabled" : "error"} sx={{ mr: 1.5 }} />
                                Delete
                              </MenuItem>
                            </span>
                          </Tooltip>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid #f0f0f0',
              bgcolor: '#fff'
            }}
          >
            <Pagination
              count={Math.ceil(totalCount / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              color="primary"
              shape="rounded"
              size="large"
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};


export default UsersTable;
