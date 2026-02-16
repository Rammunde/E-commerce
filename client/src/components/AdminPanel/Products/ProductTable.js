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
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchField from "../Users/SearchField";
import ProductDialog from "./ProductDialog";
import { useDispatch } from "react-redux";
import { updateGlobalItemCount } from "../../../commonApi";
import ProductImagesDialog from "./ProductImagesDialog";

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

const ProductTable = () => {
  const dispatch = useDispatch();

  const initialSearchRender = useRef(true);
  const [productList, setProductList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [open, setOpen] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [mode, setMode] = useState("add");
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleOpenImages = (images) => {
    setSelectedImages(images);
    setOpenImageDialog(true);
  };

  const handleCloseImages = () => {
    setOpenImageDialog(false);
  };

  const getAllProductList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/getAllProductList`, {
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
      setProductList(data?.productList || []);
      setTotalCount(data?.totalCount || 0);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch products",
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
      getAllProductList();
    }
  }, [searchString, getAllProductList]);

  useEffect(() => {
    getAllProductList();
  }, []);

  const handleMenuClick = (event, productId) => {
    setAnchorEl(event.currentTarget);
    setCurrentProductId(productId);
  };

  const handleEdit = (product) => {
    setProductDetails(product);
    setOpen(true);
    setMode("edit");
  };

  const handleDelete = async (productId) => {
    try {
      await fetch(`${API_BASE_URL}/products/deleteProduct/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
      getAllProductList();
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.data?._id) {
        updateGlobalItemCount(user.data._id, dispatch);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete product",
        severity: "error",
      });
    }
  };

  const handleExport = async () => {
    if (!productList?.length) {
      setSnackbar({
        open: true,
        message: "No products to export",
        severity: "warning",
      });
      return;
    }

    try {
      // Generate CSV from current product list
      const headers = ["Name", "Price", "Company", "Description"];
      const csvHeaders = headers.join(",");
      const csvRows = productList.map((product) =>
        [
          `"${product.name || ""}"`,
          `"${product.price || ""}"`,
          `"${product.company || ""}"`,
          `"${product.productDescription || ""}"`,
        ].join(",")
      );
      const csvContent = [csvHeaders, ...csvRows].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_export.csv");
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

      <ProductImagesDialog
        open={openImageDialog}
        images={selectedImages}
        onClose={handleCloseImages}
      />

      {open && (
        <ProductDialog
          open={open}
          onClose={() => {
            setOpen(false);
            setMode("add");
            getAllProductList();
          }}
          mode={mode}
          product={productDetails}
        />
      )}

      <Grid sx={{ paddingBottom: "2rem" }}>
        <Typography variant="h6" color="#525861">
          Products List (
          <span style={{ color: "#969ca5" }}>{totalCount} Products</span>)
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
          namesList={[]}
        />

        <Grid sx={{ marginTop: "0.5rem", display: "flex" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ height: "2.5rem", marginRight: "0.5rem" }}
            onClick={() => {
              setOpen(true);
              setProductDetails({});
            }}
          >
            Add New Product
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
          <Table sx={{ width: "100%" }} aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell sx={styles.tableHeaderCell}>Name</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Price</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Company Name</TableCell>
                <TableCell sx={styles.tableHeaderCell}>User</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Description</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Images</TableCell>
                <TableCell align="right" sx={styles.tableHeaderCell}>
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
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.company}</TableCell>
                    <TableCell>{product?.product_name}</TableCell>
                    <TableCell>{product?.productDescription}</TableCell>
                    <TableCell>
                      {product?.productImages?.length > 0 ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenImages(product.productImages)}
                        >
                          View Images ({product.productImages.length})
                        </Button>
                      ) : (
                        "No Images"
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, product?._id)}
                        color="primary"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && currentProductId === product?._id}
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
          sx={{ marginTop: "16px", paddingBottom: "16px" }}
        >
          <Pagination
            count={Math.ceil((productList?.length || 0) / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductTable;
