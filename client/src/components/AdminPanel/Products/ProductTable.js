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
  LinearProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
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
  const importInputRef = useRef(null);
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
  const [importProgress, setImportProgress] = useState(null); // null | { done, total }
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

  // ─── EXPORT ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!productList?.length) {
      setSnackbar({ open: true, message: "No products to export", severity: "warning" });
      return;
    }
    try {
      const exportData = productList.map(({ userId, registrationDate, updatedAt, ...rest }) => rest);
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: `${productList.length} product(s) exported successfully`, severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Export failed", severity: "error" });
    }
  };

  // ─── IMPORT ──────────────────────────────────────────────────────────────────
  /** Convert a base64 data-URI string to a File object */
  const base64ToFile = (dataUrl, filename) => {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected later
    e.target.value = "";

    let products;
    try {
      const text = await file.text();
      products = JSON.parse(text);
      if (!Array.isArray(products) || !products.length) throw new Error();
    } catch {
      setSnackbar({ open: true, message: "Invalid file. Please select a valid products JSON file.", severity: "error" });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.data?._id;
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    // Build a Set of existing _ids for fast O(1) lookup
    const existingIds = new Set(productList.map((p) => p._id));

    setImportProgress({ done: 0, total: products.length });
    setIsLoading(true);

    for (let i = 0; i < products.length; i++) {
      const p = products[i];

      // ── Skip duplicates ──────────────────────────────────────────────────────
      if (p._id && existingIds.has(p._id)) {
        skippedCount++;
        setImportProgress({ done: i + 1, total: products.length });
        continue;
      }
      try {
        const formData = new FormData();
        formData.append("name", p.name || "");
        formData.append("price", Number(p.price) || 0);
        formData.append("originalPrice", Number(p.originalPrice || p.price) || 0);
        formData.append("company", p.company || "");
        formData.append("userId", userId || "");
        formData.append("productDescription", p.productDescription || "");

        // Convert base64 images to File blobs
        if (Array.isArray(p.productImages)) {
          p.productImages.forEach((imgBase64, idx) => {
            if (typeof imgBase64 === "string" && imgBase64.startsWith("data:")) {
              formData.append("productImages", base64ToFile(imgBase64, `image_${idx}.jpg`));
            }
          });
        }

        const resp = await fetch(`${API_BASE_URL}/products/addProduct`, { method: "POST", body: formData });
        const data = await resp.json();
        if (!data.err) successCount++; else failCount++;
      } catch {
        failCount++;
      }
      setImportProgress({ done: i + 1, total: products.length });
    }

    setIsLoading(false);
    setImportProgress(null);
    getAllProductList();
    updateGlobalItemCount(userId, dispatch);

    const parts = [];
    if (successCount) parts.push(`${successCount} imported`);
    if (skippedCount) parts.push(`${skippedCount} already existed (skipped)`);
    if (failCount) parts.push(`${failCount} failed`);
    const severity = failCount > 0 ? "warning" : skippedCount > 0 ? "info" : "success";
    setSnackbar({ open: true, message: parts.join(', '), severity });
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
            <Grid item sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

              {/* Hidden file input for import */}
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                hidden
                onChange={handleImportFileChange}
              />

              <Tooltip title="Export all products as JSON (includes images)">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FileDownloadIcon fontSize="small" />}
                  sx={styles.actionButton}
                  onClick={handleExport}
                >
                  Export JSON
                </Button>
              </Tooltip>

              <Tooltip title="Import products from a previously exported JSON file">
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<FileUploadIcon fontSize="small" />}
                  sx={styles.actionButton}
                  onClick={() => importInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Import JSON
                </Button>
              </Tooltip>
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

        {/* Import progress bar */}
        {importProgress && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Importing products… {importProgress.done} / {importProgress.total}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(importProgress.done / importProgress.total) * 100}
            />
          </Paper>
        )}

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
