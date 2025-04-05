import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography, Box, Paper } from "@mui/material";
import { useDispatch } from "react-redux";
import { updateGlobalItemCount } from "../commonApi";

const ProductPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const [respMsg, setRespMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const products = [
    {
      id: 'P1',
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
      id: 'P2',
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
      id: 'P3',
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
      id: 'P4',
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

  const product = products.find((prod) => prod.id.toString() === id);

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
    formData.append('product_id', product_id);
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
            const file = new File([blob], `image-${index + 1}.jpg`, { type: blob.type });
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
        setIsError(data?.err);
        updateGlobalItemCount(res?.data?._id, dispatch)
        console.log(data);})
      .catch((err) => {
        setRespMsg("Failed to add product to the cart");
        setIsError(true);
        console.error("Error:", err)});
  };


  const closeAlert = () => {
    setRespMsg("");
    setIsError(false);
  };

  useEffect(() => {
    let time = 7000;
    if (isError) {
      time = 10000;
    }
    const timmer = setTimeout(() => {
      closeAlert();
    }, time);
    return () => clearTimeout(timmer);
  }, [respMsg]);

  if (!product) {
    return (
      <Grid container spacing={3} padding={3}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          {respMsg &&
            (!isError ? (
              <Alert severity="success" onClose={closeAlert}>
                {respMsg}
              </Alert>
            ) : (
              <Alert severity="error" onClose={closeAlert}>
                {respMsg}
              </Alert>
            ))}
        </Grid>
        <Grid item xs={2}></Grid>
        {products.map((prod) => (
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
  }

  //Single product view
  return (
    <Grid container spacing={4} padding={4}>
      <Grid item xs={12} md={6}>
        <Box textAlign="center">
          <img
            id="mainImage"
            src={product.images[0]}
            alt={product.name}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
          <Box display="flex" justifyContent="center" marginTop={2}>
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
                onClick={() => handleThumbnailClick(image)}
              />
            ))}
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h4" gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {product.price}
        </Typography>
        <Typography variant="body1" paragraph>
          {product.description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            handleAddToCart(
              product.id,
              product.name,
              product.price,
              product?.company,
              product.description,
              product
            )
          }
        >
          Add to Cart
        </Button>
      </Grid>
    </Grid>
  );
};

export default ProductPage;
