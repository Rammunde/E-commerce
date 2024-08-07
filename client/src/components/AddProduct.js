import React, { useState, useEffect } from "react";
import { Container, Paper, Grid, TextField, Button, Alert } from "@mui/material";
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

  const addProduct = () => {
    let user_id = localStorage.getItem('user');
    let id = JSON.parse(user_id);
    setUserId(id?.data?._id);
    fetch("http://localhost:5000/products/addProduct", {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        name: productName,
        price: productPrice,
        company: productCampany,
        userId: id?.data?._id,
        productDescription: productDescription
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setRespMsg(data?.msg);
        setIsError(data?.err);
      });
  };

  useEffect(() => {
    fetch("http://localhost:5000/products/getProductList", {
      method: "get",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        // setRespMsg(data?.msg);
        // setIsError(data?.err);
      });
  }, []);

  const handleCloseResponeMsg = () => {
    setRespMsg("");
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
                <Grid item xs={12} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Price"
                    variant="outlined"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
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
