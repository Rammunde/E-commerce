import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Alert,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { AttachFile, Clear } from "@mui/icons-material";

// API Configuration
const API_BASE_URL = "http://localhost:5000";

const ProductDialog = ({ open, onClose, mode = "add", product }) => {
  /* ================= STATES ================= */
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCompany, setProductCompany] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [fileNames, setFileNames] = useState("");
  const [keepImageIndexes, setKeepImageIndexes] = useState([]);

  const [respMsg, setRespMsg] = useState("");
  const [error, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = mode === "edit";

  /* ================= PREFILL FOR EDIT ================= */
  useEffect(() => {
    if (isEditMode && product) {
      setProductName(product.name || "");
      setProductCompany(product.company || "");
      setProductDescription(product.productDescription || "");
      setProductPrice(product.price || "");

      // Keep all existing images by default
      if (product.productImages?.length) {
        setKeepImageIndexes(product.productImages.map((_, index) => index));
      }

      setFileNames("");
    }

    if (mode === "add") {
      clearForm();
    }
  }, [mode, product, isEditMode]);

  /* ================= HANDLERS ================= */
  const handleImageChange = (e) => {
    const files = e.target.files;
    setProductImages(files);
    setFileNames(
      Array.from(files)
        .map((f) => f.name)
        .join(", ")
    );
  };

  const handleClearFiles = () => {
    setProductImages([]);
    setFileNames("");
  };

  const handleFileInputClick = () => {
    document.getElementById("file-input").click();
  };

  const handleCloseResponseMsg = () => {
    setRespMsg("");
  };

  const clearForm = () => {
    setProductName("");
    setProductCompany("");
    setProductDescription("");
    setProductPrice("");
    setProductImages([]);
    setFileNames("");
    setKeepImageIndexes([]);
    setRespMsg("");
  };

  const isFormValid = () => {
    return productName && productCompany && productDescription && productPrice;
  };

  /* ================= ADD PRODUCT API ================= */
  const addProduct = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.data?._id;

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", Number(productPrice));
    formData.append("originalPrice", Number(productPrice));
    formData.append("company", productCompany);
    formData.append("userId", userId);
    formData.append("productDescription", productDescription);

    Array.from(productImages).forEach((file) =>
      formData.append("productImages", file)
    );

    const resp = await fetch(`${API_BASE_URL}/products/addProduct`, {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();
    return data;
  };

  /* ================= EDIT PRODUCT API ================= */
  const updateProduct = async () => {
    const formData = new FormData();

    formData.append("name", productName);
    formData.append("price", Number(productPrice));
    formData.append("company", productCompany);
    formData.append("productDescription", productDescription);
    formData.append("keepImageIndexes", JSON.stringify(keepImageIndexes));

    if (productImages?.length) {
      Array.from(productImages).forEach((file) =>
        formData.append("productImages", file)
      );
    }

    const resp = await fetch(
      `${API_BASE_URL}/products/updateProduct/${product._id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    const data = await resp.json();
    return data;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setIsLoading(true);
    setRespMsg("");

    try {
      const data = isEditMode ? await updateProduct() : await addProduct();
      setRespMsg(data.msg);
      setIsError(data.err);

      if (!data.err) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setRespMsg("An error occurred. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: "0.5rem",
          width: "30rem",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="primary">
          {isEditMode ? "Edit Product" : "Add Product"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2}>
          {/* RESPONSE MSG */}
          <Grid item xs={12}>
            {respMsg && (
              <Alert
                onClose={handleCloseResponseMsg}
                severity={error ? "error" : "success"}
                sx={{ mb: 2 }}
              >
                {respMsg}
              </Alert>
            )}
          </Grid>

          {/* FORM FIELDS */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company"
                  value={productCompany}
                  onChange={(e) => setProductCompany(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </Grid>

              {/* FILE INPUT */}
              <Grid item xs={12}>
                <input
                  type="file"
                  id="file-input"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
                <TextField
                  fullWidth
                  disabled
                  label="Select Images"
                  value={fileNames}
                  InputProps={{
                    endAdornment: (
                      <>
                        <Button
                          component="span"
                          startIcon={<AttachFile />}
                          onClick={handleFileInputClick}
                        />
                        <IconButton onClick={handleClearFiles}>
                          <Clear />
                        </IconButton>
                      </>
                    ),
                  }}
                />
              </Grid>

              {/* EXISTING IMAGES */}
              {isEditMode && product?.productImages?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Existing Images (click to remove)
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {product.productImages.map((img, index) =>
                      keepImageIndexes.includes(index) ? (
                        <img
                          key={index}
                          src={img}
                          alt="product"
                          width={60}
                          height={60}
                          style={{
                            borderRadius: 6,
                            cursor: "pointer",
                            border: "2px solid #1976d2",
                            objectFit: "cover",
                          }}
                          onClick={() =>
                            setKeepImageIndexes((prev) =>
                              prev.filter((i) => i !== index)
                            )
                          }
                          title="Click to remove"
                        />
                      ) : null
                    )}
                  </div>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          padding: "0 1.5rem 1rem",
        }}
      >
        <Button onClick={onClose} variant="outlined" fullWidth disabled={isLoading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : isEditMode ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
