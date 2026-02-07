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
} from "@mui/material";
import { AttachFile, Clear } from "@mui/icons-material";

const ProductDialog = ({ open, onClose, mode = "add", product }) => {
  /* ================= STATES ================= */
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCampany, setProductCampany] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImages, setProductImages] = useState([]); // new files
  const [fileNames, setFileNames] = useState(""); // new file names display
  const [keepImageIndexes, setKeepImageIndexes] = useState([]); // indexes of existing images to keep

  const [respMsg, setRespMsg] = useState("");
  const [error, setIsError] = useState(false);

  /* ================= PREFILL FOR EDIT ================= */
  useEffect(() => {
    if (mode === "edit" && product) {
      setProductName(product.name || "");
      setProductCampany(product.company || "");
      setProductDescription(product.productDescription || "");
      setProductPrice(product.price || "");

      // Keep all existing images by default
      if (product.productImages?.length) {
        setKeepImageIndexes(
          product.productImages.map((_, index) => index)
        );
      }

      setFileNames(""); // do not show base64 in input
    }

    if (mode === "add") {
      clearForm();
    }
  }, [mode, product]);

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

  const handleCloseResponeMsg = () => {
    setRespMsg("");
  };

  const clearForm = () => {
    setProductName("");
    setProductCampany("");
    setProductDescription("");
    setProductPrice("");
    setProductImages([]);
    setFileNames("");
    setKeepImageIndexes([]);
  };

  /* ================= ADD PRODUCT API ================= */
  const addProduct = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.data?._id;

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", Number(productPrice));
    formData.append("originalPrice", Number(productPrice));
    formData.append("company", productCampany);
    formData.append("userId", userId);
    formData.append("productDescription", productDescription);

    Array.from(productImages).forEach((file) =>
      formData.append("productImages", file)
    );

    const resp = await fetch("http://localhost:5000/products/addProduct", {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();
    setRespMsg(data.msg);
    setIsError(data.err);
  };

  /* ================= EDIT PRODUCT API ================= */
  const updateProduct = async () => {
    const formData = new FormData();

    formData.append("name", productName);
    formData.append("price", Number(productPrice));
    formData.append("company", productCampany);
    formData.append("productDescription", productDescription);

    // ✅ send indexes only (existing images to keep)
    formData.append(
      "keepImageIndexes",
      JSON.stringify(keepImageIndexes)
    );

    // ✅ append only new images
    if (productImages?.length) {
      Array.from(productImages).forEach((file) =>
        formData.append("productImages", file)
      );
    }

    const resp = await fetch(
      `http://localhost:5000/products/updateProduct/${product._id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    const data = await resp.json();
    setRespMsg(data.msg);
    setIsError(data.err);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (mode === "edit") {
      updateProduct();
    } else {
      addProduct();
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
          {mode === "edit" ? "Edit Product" : "Add Product"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2}>
          {/* RESPONSE MSG */}
          <Grid item xs={12}>
            {respMsg && (
              <Alert
                onClose={handleCloseResponeMsg}
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
                  value={productCampany}
                  onChange={(e) => setProductCampany(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price"
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
              {mode === "edit" &&
                product?.productImages?.length > 0 && (
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
        <Button onClick={onClose} variant="outlined" fullWidth>
          Cancel
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={
            !productName ||
            !productCampany ||
            !productDescription ||
            !productPrice
          }
        >
          {mode === "edit" ? "Update Product" : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
