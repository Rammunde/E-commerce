import React, { useState, useEffect } from "react";
import { Container, Paper, Grid, TextField, Button, Alert, IconButton } from "@mui/material";
import { AttachFile, Clear } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCampany, setProductCampany] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [respMsg, setRespMsg] = useState("");
  const [error, setIsError] = useState(false);
  const [userId, setUserId] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [fileNames, setFileNames] = useState('');

  const addProduct = () => {
    let user_id = localStorage.getItem('user');
    let id = JSON.parse(user_id);
    setUserId(id?.data?._id);

    console.log("productImages from admin", productImages)
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", Number(productPrice));
    formData.append('originalPrice', Number(productPrice));
    formData.append("company", productCampany);
    formData.append("userId", userId);
    formData.append("productDescription", productDescription);
    Array.from(productImages).forEach((file) => {
      formData.append("productImages", file);
    });

    fetch("http://localhost:5000/products/addProduct", {
      method: "POST",
      body: formData // Do not set the content-Type header manually
    })
      .then((resp) => resp.json())
      .then((data) => {
        setRespMsg(data?.msg);
        setIsError(data?.err);
      });
  };


  const handleCloseResponeMsg = () => {
    setRespMsg("");
  };
  const handleImageChange = (event) => {
    const files = event.target.files;
    setProductImages(files);

    const names = Array.from(files).map(file => file.name).join(', ');
    console.log("File names", names);
    setFileNames(names);
  };

  const handleClearFiles = () => {
    setProductImages([]);
    setFileNames('');
    // document.getElementById('file-input').value = '';
  };
  const handleFileInputClick = () => {
    document.getElementById('file-input').click();
  };

  const clareForm = () => {
    setProductName('');
    setProductCampany('');
    setProductPrice('');
    setProductDescription("");
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 8,
        mb: 8,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: "2%",
          width: "100%",
        }}
      >
        <Grid container spacing={2}>
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
          <Grid item xs={12}>
            <h1>Add Product</h1>
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company"
                    variant="outlined"
                    value={productCampany}
                    onChange={(e) => setProductCampany(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    variant="outlined"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Price"
                    variant="outlined"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sx={{ mb: 2 }}>
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <TextField
                      variant="outlined"
                      fullWidth
                      disabled
                      value={fileNames}
                      label="Select Images"
                      InputProps={{
                        endAdornment: (
                          <>
                            <Button
                              component="span"
                              startIcon={<AttachFile />}
                              sx={{
                                height: '100%',
                                width: '40px',
                                minWidth: 'auto',
                                paddingLeft: '2px',
                                paddingRight: '2px',
                                '&:hover': {
                                  cursor: 'pointer',
                                },
                              }}
                              htmlFor="file-input"
                              onClick={handleFileInputClick}
                            >
                              <span style={{ display: 'none' }}>Browse</span>
                            </Button>
                            <IconButton
                              component="span"
                              sx={{
                                height: '100%',
                                paddingLeft: "4px",
                                '&:hover': {
                                  cursor: 'pointer',
                                },
                              }}
                              onClick={handleClearFiles}
                            >
                              <Clear />
                            </IconButton>
                          </>
                        ),
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={clareForm}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={!productName || !productCampany || !productDescription || !productPrice}
                    onClick={addProduct}
                  >
                    Add Product
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AddProduct;
