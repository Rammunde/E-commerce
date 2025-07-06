import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import {
  Grid,
  Button,
  Typography,
  Box,
  Paper
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateGlobalItemCount } from "../commonApi";
import { Snackbar } from "@mui/material";
import CustomizedInputBase from "./ProductUtils/CustomizedInputBase";

const ProductPage = () => {
  const dispatch = useDispatch();
  const [respMsg, setRespMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [searchProduct, setSearchProduct] = useState("");

  const products = [
    {
      id: "P1",
      images: [
        require("./Images/Mobile.jpg"),
        require("./Images/mobile-2.jpg"),
        require("./Images/Watch.jfif"),
      ],
      name: "Product 1",
      price: "$10.00",
      company: "Dell",
      description: "This is a detailed description for product 1.",
    },
    {
      id: "P2",
      images: [
        require("./Images/mobile-2.jpg"),
        require("./Images/Mobile.jpg"),
        require("./Images/Watch.jfif"),
      ],
      name: "Product 2",
      price: "$20.00",
      company: "Dell",
      description: "This is a detailed description for product 2.",
    },
    {
      id: "P3",
      images: [
        require("./Images/Watch.jfif"),
        require("./Images/Mobile.jpg"),
        require("./Images/mobile-2.jpg"),
      ],
      name: "Product 3",
      price: "$30.00",
      company: "Dell",
      description: "This is a detailed description for product 3.",
    },
    {
      id: "P4",
      images: [
        require("./Images/mobile-3.jpg"),
        require("./Images/Mobile.jpg"),
        require("./Images/mobile-2.jpg"),
      ],
      name: "Product 4",
      price: "$40.00",
      company: "Dell",
      description: "This is a detailed description for product 4.",
    },
  ];

  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const handleClose = () => {
    setOpen(false);
  };

  const handleThumbnailClick = (image) => {
    const mainImage = document.getElementById("mainImage");
    if (mainImage) {
      mainImage.src = image;
    }
  };

  const handleAddToCart = (
    product_id,
    productName,
    productPrice,
    productCampany,
    productDescription,
    product
  ) => {
    let user_id = localStorage.getItem("user");
    let res = JSON.parse(user_id);

    const formData = new FormData();
    formData.append("product_id", product_id);
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("company", productCampany);
    formData.append("userId", res?.data?._id);
    formData.append("productDescription", productDescription);

    Promise.all(
      product.images.map((image, index) =>
        fetch(image)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `image-${index + 1}.jpg`, {
              type: blob.type,
            });
            formData.append("productImages", file);
          })
      )
    )
      .then(() => {
        // Log form data to verify
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }

        // Send form data to the server
        return fetch("http://localhost:5000/products/addProductToCart", {
          method: "POST",
          body: formData,
        });
      })
      .then((res) => res.json())
      .then((data) => {
        setRespMsg(data?.msg);
        updateGlobalItemCount(res?.data?._id, dispatch);
        setSeverity("success");
        setOpen(true);
      })
      .catch((err) => {
        setRespMsg("Failed to add product to the cart");
        setSeverity("error");
        setOpen(true);
        console.error("Error:", err);
      });
  };

  return (
    <Grid container spacing={3} padding={3}>
      <Grid container justifyContent="center" alignItems="center" mt={3} mb={2}>
        <Grid item xs={12} sm={8}>
          <CustomizedInputBase onSearch={setSearchProduct} />{" "}
          {
            // Used for the search functionality
          }{" "}
        </Grid>
      </Grid>

      <Grid item xs={8}>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity={severity}
            sx={{ width: "100%" }}
          >
            {respMsg}
          </Alert>
        </Snackbar>
      </Grid>
      <Grid item xs={2}></Grid>
      {filteredProducts.map((prod) => (
        <Grid item xs={12} sm={4} md={3} key={prod.id}>
          <Paper style={{ borderRadius: "25px", padding: "10px" }}>
            <Box padding={2}>
              <img
                src={prod.images[0]}
                alt={prod.name}
                style={{
                  width: "80%",
                  height: "200px",
                  // objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <Box display="flex" justifyContent="center" marginTop={1}>
                {prod.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${prod.name} thumbnail ${index + 1}`}
                    style={{
                      width: "50px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                    onClick={() => handleThumbnailClick(image)}
                  />
                ))}
              </Box>
              <Typography variant="h6" gutterBottom>
                {prod.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {prod.price}
              </Typography>
              <Typography variant="body2" paragraph>
                {prod.description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  handleAddToCart(
                    prod.id,
                    prod.name,
                    prod.price,
                    prod?.company,
                    prod?.description,
                    prod
                  )
                }
              >
                Add to Cart
              </Button>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductPage;
