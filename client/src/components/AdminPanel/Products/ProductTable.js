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
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
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
          limit: 100,
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

        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121' }}>
                Product Management
                <Typography component="span" variant="body1" sx={{ ml: 1.5, color: '#878787' }}>
                  ({totalCount} Items)
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
                  setProductDetails({});
                }}
              >
                Add New Product
              </Button>
              <Button
                variant="outlined"
                color="primary"
                sx={styles.actionButton}
                onClick={handleExport}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <SearchField
            label="Search by product name..."
            setSearchString={setSearchString}
            namesList={[]}
          />
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="products table">
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeaderCell}>PRODUCT</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>PRICE</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>BRAND</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>OWNER</TableCell>
                  <TableCell sx={styles.tableHeaderCell}>DESCRIPTION</TableCell>
                  <TableCell align="right" sx={styles.tableHeaderCell}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productList
                  ?.slice(
                    (page - 1) * rowsPerPage,
                    (page - 1) * rowsPerPage + rowsPerPage
                  )
                  .map((product) => (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '4px',
                              overflow: 'hidden',
                              border: '1px solid #eee',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#fff',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleOpenImages(product.productImages)}
                          >
                            {product?.productImages?.length > 0 ? (
                              <img
                                src={product.productImages[0]}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.disabled">No Image</Typography>
                            )}
                          </Box>
                          <Typography sx={{ fontWeight: 500 }}>{product.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>₹{product.price}</TableCell>
                      <TableCell>{product.company}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2874f0', bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: '4px', display: 'inline-block', fontWeight: 500 }}>
                          {product?.product_name || 'System'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product?.productDescription}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, product?._id)}
                          sx={{ color: '#2874f0' }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && currentProductId === product?._id}
                          onClose={() => setAnchorEl(null)}
                          PaperProps={{
                            elevation: 2,
                            sx: { borderRadius: '8px', minWidth: '120px' }
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              handleEdit(product);
                              setAnchorEl(null);
                            }}
                          >
                            <EditIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              handleDelete(product?._id);
                              setAnchorEl(null);
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" sx={{ mr: 1.5 }} />
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && productList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        No products found in inventory
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
              count={Math.ceil((productList?.length || 0) / rowsPerPage)}
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

export default ProductTable;
