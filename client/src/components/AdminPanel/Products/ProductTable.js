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
  Tooltip,
  Pagination,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchField from "../Users/SearchField";
import ProductDialog from "./ProductDialog";
import { useDispatch } from "react-redux";
import { updateGlobalItemCount } from "../../../commonApi";

const useStyles = makeStyles((theme) => ({
  layoutSetting: {
    marginTop: "2rem",
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

const UsersTable = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const initialSearchRender = useRef(true);
  const [productList, setProductList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [searchString, setSearchString] = useState("");
  // const [nameList, setNameList] = useState([]);
  const [open, setOpen] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [mode, setMode] = useState("add");

  const getAllProductList = () => {
    fetch(`http://localhost:5000/products/getAllProductList`, {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        searchString: searchString,
        limit: 10,
        offset: 0,
        sortBy: "name",
        sortOrder: "asc",
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setProductList(data?.productList);
        setTotalCount(data?.totalCount);
        // const names = data?.data?.map((record) => record.name);
        // setNameList(names);
      });
  };

  useEffect(() => {
    if (initialSearchRender.current) {
      initialSearchRender.current = false;
    } else {
      console.log("called");
      getAllProductList();
    }
  }, [searchString]);

  useEffect(() => {
    getAllProductList();
  }, []);

  const handleMenuClick = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };

  const handleEdit = (product) => {
    setProductDetails(product);
    setOpen(true);
    setMode('edit');
  };

  const handleDelete = (Id) => {
    fetch(`http://localhost:5000/products/deleteProduct/${Id}`, {
      method: "DELETE",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then(() => {
        getAllProductList();
        const user_id = localStorage.getItem('user');
        const id = JSON.parse(user_id);
        updateGlobalItemCount(id?.data?._id, dispatch);      });
  };

const handleExport =()=>{
    // fetch("http://localhost:5000/users/getAllUserToExport", {
    //   method: "post",
    //   headers: { "content-Type": "application/json" },
    //   body: JSON.stringify({
    //     searchString: searchString,
    //     limit: 10, // Consider removing this for a full export
    //     offset: 0, // Consider removing this
    //     sortBy: "name",
    //     sortOrder: "asc",
    //   }),
    // })
    //   .then((resp) => resp.json())
    //   .then((data) => {
    //     // Step 1: Check if data is valid and has at least one item
    //     if (!data || data.data.length === 0) {
    //       console.error("No data to export.");
    //       return;
    //     }

    //     // Step 2: Extract headers from the first object
    //     const headers = Object.keys(data.data[0]);
    //     const csvHeaders = headers.join(',');

    //     // Step 3: Map data to CSV rows
    //     const csvRows = data.data.map(row => {
    //       return headers.map(header => `"${row[header]}"`).join(',');
    //     });

    //     // Step 4: Combine headers and rows into a single CSV string
    //     const csvContent = [csvHeaders, ...csvRows].join('\n');

    //     // Step 5: Create a Blob and download link
    //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    //     const url = URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', 'Users csv');
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //     URL.revokeObjectURL(url);
    //   })
    //   .catch(error => {
    //     console.error("Error exporting data:", error);
    //   });
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Container component="main" maxWidth="md" className={classes.layoutSetting}>
      {open && (
        <ProductDialog
          open={open}
          onClose={()=>{setOpen(false); setMode("add"); getAllProductList();}}
          mode = {mode}
          product={productDetails}
        />
      )}
      {/* open, onClose, mode = "add", product */}
      <Grid style={{ paddingBottom: "2rem" }}>
        <Typography variant="h6" color={"#525861ff"}>
          {" "}
          Products List (
          <span style={{ color: "#969ca5ff" }}>{totalCount} Products</span>)
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
          namesList={[]}
        />

        <Grid style={{ marginTop: "0.5rem", display: "flex" }} >
          <Button
            fullWidth
            variant="contained"
            color="primary"
            style={{ height: "2.5rem", marginRight: "0.5rem" }}
            onClick={() => {
              setOpen(true);
              setProductDetails({});
            }}
          >
            Add New Product
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            style={{ width: "10rem", height: "2.5rem" }}
            onClick={handleExport}
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
                <TableCell style={tableHeaderCell}>Price</TableCell>
                <TableCell style={tableHeaderCell}>Company Name</TableCell>
                <TableCell style={tableHeaderCell}>User</TableCell>
                <TableCell style={tableHeaderCell}>Description</TableCell>
                <TableCell align="right" style={tableHeaderCell}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productList
                ?.slice(
                  (page - 1) * rowsPerPage,
                  (page - 1) * rowsPerPage + rowsPerPage
                )
                .map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.name}
                    </TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.company}</TableCell>
                    <TableCell>{product?.product_name}</TableCell>
                    <TableCell>{product?.productDescription}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, product?._id)}
                        color="primary"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && currentUserId === product?._id}
                        onClose={() => setAnchorEl(null)}
                      >
                        <MenuItem
                          onClick={() => {
                            handleEdit(product);
                            setAnchorEl(null);
                          }}
                        >
                          <Tooltip title="Edit">
                            <EditIcon color="primary" />
                          </Tooltip>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleDelete(product?._id);
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
            count={Math.ceil(productList?.length / rowsPerPage)}
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