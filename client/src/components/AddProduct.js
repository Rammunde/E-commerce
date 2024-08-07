import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Container, Paper, Grid, TextField, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";


const useStyles = styled((theme) => ({
  registerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: "2%",
    width: "100%",
  },
  formElement: {
    marginBottom: theme.spacing(2),
  },
  appButton: {
    marginTop: theme.spacing(2),
  },
}));

const AddProduct = () => {
  const classes = useStyles();
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
    let id = JSON.parse(user_id)
    setUserId(id?.data?._id)
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

  useEffect(()=>{
    fetch("http://localhost:5000/products/getProductList", {
      method: "get",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        // setRespMsg(data?.msg);
        // setIsError(data?.err);
      });
  },[])

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
      className={classes.registerContainer}
    >
      <Paper elevation={3} className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {respMsg && (
              <Alert
                onClose={handleCloseResponeMsg}
                severity= {error ? "error" : "success"}
                style={{ marginBottom: "16px" }}
              >
                {respMsg}
              </Alert>
            )}
          </Grid>
          <Grid item xs={12}>
            <h1>Add Product</h1>
            <form className={classes.form}>
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
                    value={productCampany}
                    onChange={(e) => setProductCampany(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} className={classes.formElement}>
                  <TextField
                    fullWidth
                    label="Description"
                    variant="outlined"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    className={classes.appButton}
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
                    className={classes.appButton}
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
