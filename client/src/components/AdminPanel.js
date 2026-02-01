import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Container, Paper, Grid, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, Button, Menu, MenuItem, IconButton, TextField, Fade, Backdrop, Modal, Tabs, Tab, Tooltip } from "@mui/material";
import Pagination from "@mui/material/Pagination"; // Pagination is part of @mui/material in v5
import Alert from "@mui/material/Alert"; // Alert is part of @mui/material in v5
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const useStyles = styled((theme) => ({
  tableContainer: {
    marginTop: theme.spacing(4),
    maxHeight: 500,
    overflowY: "auto",
  },
  table: {
    width: "100%",
  },
  tableHeaderCell: {
    backgroundColor: "#e5e7f2",
    fontWeight: "bold",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  paper: {
    padding: "10px",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 2, 3, 2),
    width: "400px",
  },
  tabIndicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > div': {
      maxWidth: 100,
      width: '100%',
      backgroundColor: '#3f51b5', // Customize the color if needed
    },
  },
}));
const tableContainer = {
  marginTop: '16px', // Assuming theme.spacing(4) is 16px
  maxHeight: 500,
  overflowY: "auto",
};

const table = {
  width: "100%",
};

const tableHeaderCell = {
  backgroundColor: "#e5e7f2",
  fontWeight: "bold",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const paper = {
  padding: "10px",
};

const modal = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalContent = {
  backgroundColor: "#fff", // Assuming theme.palette.background.paper is #fff
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Assuming theme.shadows[5] is this value
  padding: "16px 16px 24px 16px", // Assuming theme.spacing(2, 2, 3, 2) translates to 16px 16px 24px 16px
  width: "400px",
};

const tabIndicator = {
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  '& > div': {
    maxWidth: 100,
    width: '100%',
    backgroundColor: '#3f51b5', // Customize the color if needed
  },
};

const AddProduct = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [respMsg, setRespMsg] = useState();
  const [respMsgOnEdit, setRespMsgOnEdit] = useState();
  const [error, setError] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [productCompany, setProductCompany] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("***********");
  const [userEmail, setUserEmail] = useState("");
  const [editUserId, setEditingUserId] = useState(0);
  const [userMobile, setUserMobile] = useState("");
  const [userRole, setUserRole] = useState("");



  const getProductList = () => {
    fetch("http://localhost:5000/products/getProductList", {
      method: "get",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        setProducts(data.allProducts);
      });
  };

  useEffect(() => {
    getProductList();
  }, []);


  const getAllUserList = () => {
    fetch("http://localhost:5000/users/getAllUsers", {
      method: "get",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        setUsers(data?.data);
        // setRespMsg(data?.msg);
      });
  }


  const handleUserMenuClick = (event, userId) => {
    console.log("user id", userId)
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };

  const handleEditUser = (user) => {
    setUserFirstName(user?.firstName);
    setUserLastName(user?.lastName);
    setUserName(user?.username);
    setUserEmail(user?.email);
    setPassword(user?.password);
    setUserMobile(user?.mobile);
    setEditingUserId(user?._id)
    // setUserRole(user?.role);
    setOpenUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    fetch(`http://localhost:5000/users/deleteUser/${userId}`, {
      method: "DELETE",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        getAllUserList();
        // console.log(data);
        // setUsers(data?.data);
        // setRespMsg(data?.msg);
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
        mobile: userMobile
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        getAllUserList();
        setError(false);
        setRespMsgOnEdit(data?.msg);
        if (!data?.err) {
          setTimeout(() => {
            setRespMsgOnEdit('');
            setError(false);
            setOpenUserModal(false);
          }, 1000);
        }
      });
  };

  useEffect(() => {
    getAllUserList()
  }, []);

  const deleteRecord = (Id) => {
    fetch(`http://localhost:5000/products/deleteProduct/${Id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        getProductList();
        setError(data?.err);
        setRespMsg(data?.msg);
      })
      .catch((error) => console.error("Fetch error:", error));
  };



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setProductName("");
    setProductCompany("");
    setProductPrice("");
  };
  const handleSelectOne = (event, productId) => {
    if (event.target.checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allProductIds = products.map((product) => product._id);
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleClose = () => {
    setRespMsg("");
    setRespMsgOnEdit('');
    setError(false);
  };

  const handleMenuClick = (event, productId) => {
    setAnchorEl(event.currentTarget);
    setCurrentProductId(productId);
  };
  console.log("currentProductId", currentProductId)

  const handleEdit = (product) => {
    setRespMsg("");
    setError(false);
    setCurrentProductId(product?._id);
    setProductName(product.name);
    setProductCompany(product.company);
    setProductPrice(product.price);
    setOpenModal(true);
    console.log("Edit product ", product);

    handleMenuClose();
  };

  const handleDelete = (productId) => {
    deleteRecord(productId);
    handleMenuClose();
  };

  const saveEditProduct = () => {
    let user_id = localStorage.getItem('user');
    let id = JSON.parse(user_id)
    // setUserId(id.data._id)
    fetch("http://localhost:5000/products/editProduct", {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        name: productName,
        price: productPrice,
        company: productCompany,
        productId: currentProductId,
        userId: id?.data?._id
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setRespMsgOnEdit(data?.msg);
        setError(data?.err);
        getProductList();
        if (!data?.err) {
          setTimeout(() => {
            setRespMsgOnEdit('');
            setError(false);
            setOpenModal(false);
          }, 1000);
        }
      });
  }
  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, products.length - page * rowsPerPage);

  return (
    <Container component="main" maxWidth="md">
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        classes={{ indicator: tabIndicator }}
        style={{ paddingBottom: "20px" }}
        TabIndicatorProps={{ children: <div /> }}
      >
        <Tab label="Users" className={classes.tabRoot} />
        <Tab label="Products" className={classes.tabRoot} />
      </Tabs>
      {/* <div>
        {tabIndex === 0 && <div>Users</div>}
        {tabIndex === 1 && <div>Products</div>}
      </div> */}
      <div className={classes.tabPanel}>
        {tabIndex === 0 && (
          <div>
            <Paper elevation={3}>
              <TableContainer>
                <Table style={table} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={tableHeaderCell}>Name</TableCell>
                      <TableCell style={tableHeaderCell}>User-Name</TableCell>
                      <TableCell style={tableHeaderCell}>Mobile</TableCell>
                      <TableCell style={tableHeaderCell}>Email</TableCell>
                      <TableCell align="right" style={tableHeaderCell}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell component="th" scope="row">{user.firstName + " " + user.lastName}</TableCell>
                        <TableCell align="left">{user.username}</TableCell>
                        <TableCell align="left">{user.mobile}</TableCell>
                        <TableCell align="left">{user.email}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-controls="user-menu"
                            aria-haspopup="true"
                            onClick={(e) => handleUserMenuClick(e, user?._id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            id="user-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl) && currentUserId === user?._id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleEditUser(user)}>
                              <Tooltip title="Edit">
                                <EditIcon color="primary" />
                              </Tooltip>
                            </MenuItem>
                            <MenuItem onClick={() => handleDeleteUser(user?._id)}>
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
              <Grid container justifyContent="flex-end" style={{ marginTop: '16px', paddingBottom: '16px' }}>
                <Pagination
                  count={Math.ceil(users.length / rowsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Grid>
            </Paper>
          </div>
        )}
        {tabIndex === 1 && (  // Products Tab
          <div>
            <Grid item xs={12}>
              {respMsg && error === false && (
                <Alert onClose={handleClose} severity="success" style={{ marginBottom: "16px" }}>
                  {respMsg}
                </Alert>
              )}
              {respMsg && error === true && (
                <Alert onClose={handleClose} severity="error" style={{ marginBottom: "16px" }}>
                  {respMsg}
                </Alert>
              )}
            </Grid>
            <Paper elevation={3}>
              <TableContainer>
                <Table className={classes.table} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      {/* <TableCell style = {tableHeaderCell}>
                        <Checkbox
                          style={{ paddingLeft: "1px" }}
                          color="primary"
                          onChange={handleSelectAll}
                          indeterminate={
                            selectedProducts.length > 0 &&
                            selectedProducts.length < products.length
                          }
                          checked={
                            selectedProducts.length === products.length &&
                            products.length !== 0
                          }
                        />
                      </TableCell> */}
                      <TableCell style={tableHeaderCell}>Name</TableCell>
                      <TableCell align="right" style={tableHeaderCell}>
                        Company
                      </TableCell>
                      <TableCell align="right" style={tableHeaderCell}>
                        Price
                      </TableCell>
                      <TableCell align="right" style={tableHeaderCell}>
                        Registration Date
                      </TableCell>
                      <TableCell align="right" style={tableHeaderCell}>
                        Images
                      </TableCell>
                      <TableCell align="right" style={tableHeaderCell}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0
                      ? products.slice(
                        (page - 1) * rowsPerPage,
                        (page - 1) * rowsPerPage + rowsPerPage
                      )
                      : products
                    ).map((product) => (
                      <TableRow key={product._id}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            onChange={(e) => handleSelectOne(e, product._id)}
                            checked={selectedProducts.includes(product._id)}
                          />
                        </TableCell> */}
                        <TableCell component="th" scope="row">
                          {product.name}
                        </TableCell>
                        <TableCell align="right">{product.company}</TableCell>
                        <TableCell align="right">{product.price}</TableCell>
                        <TableCell align="right">
                          {product?.registrationDate
                            ? moment(product?.registrationDate).format("DD-MM-YYYY")
                            : ""}
                        </TableCell>
                        <TableCell>
                          {product.productImages && product.productImages.length > 0 ? (
                            <img
                              src={product.productImages[0]} // Directly use the base64 string here
                              alt={product?.name}
                              style={{ width: 50, height: 50, objectFit: "cover" }}
                            />
                          ) : (
                            "No Image"
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={(e) => handleMenuClick(e, product._id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl) && currentProductId === product._id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleEdit(product)}>
                              <Tooltip title="Edit">
                                <EditIcon color="primary" />
                              </Tooltip>
                            </MenuItem>
                            <MenuItem onClick={() => handleDelete(product._id)}>
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
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "10px",
                }}
              >
                <Pagination
                  count={Math.ceil(products.length / rowsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  style={{ marginBottom: "2px" }}
                  color="primary"
                />
              </Grid>
            </Paper>
          </div>
        )}

      </div>
      <Modal
        style={modal}
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
      >
        <Fade in={openModal}>
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
                <h1>Edit Product</h1>
                <form className={classes.form}>
                  <Paper elevation={4} style={paper}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="Name"
                          variant="outlined"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="Company"
                          variant="outlined"
                          value={productCompany}
                          onChange={(e) => setProductCompany(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="Price"
                          variant="outlined"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} style={{ paddingTop: "10px" }}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          className={classes.appButton}
                          variant="outlined"
                          color="primary"
                          onClick={handleCloseModal}
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
                          onClick={saveEditProduct}
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
      </Modal>
      <Modal
        style={modal}
        open={openUserModal}
        onClose={handleCloseUserModal}
      >
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
                <form className={classes.form}>
                  <Paper elevation={4} style={paper}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="First Name"
                          variant="outlined"
                          value={userFirstName}
                          onChange={(e) => setUserFirstName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          variant="outlined"
                          value={userLastName}
                          onChange={(e) => setUserLastName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="Mobile Number"
                          variant="outlined"
                          value={userMobile}
                          type="number"
                          inputProps={{
                            pattern: "[0-9]*", // Only digits allowed
                            maxLength: 10
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 10) { // Allow only digits and enforce length
                              setUserMobile(value);
                            }
                            // setUserMobile(e.target.value)}
                          }
                          }
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="UserName"
                          variant="outlined"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.formElement}>
                        <TextField
                          fullWidth
                          label="Password"
                          variant="outlined"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.formElement}>
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
                          className={classes.appButton}
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
                          className={classes.appButton}
                          variant="contained"
                          color="primary"
                          disabled={userMobile?.length != 10 || !userName || !password || !userFirstName || !userLastName || !userEmail}
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
      </Modal>

    </Container>
  );

};

export default AddProduct;
