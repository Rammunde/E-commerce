import React, { useState, useEffect } from "react";
import {
  Grid,
  Button,
  Typography,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateGlobalItemCount } from "../commonApi";
import CustomizedInputBase from "./ProductUtils/CustomizedInputBase";

const ProductPage = () => {
  const dispatch = useDispatch();
  const [respMsg, setRespMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [searchProduct, setSearchProduct] = useState("");
  const [allProductList, setAllProductList] = useState([]);
  const [selectedMainImages, setSelectedMainImages] = useState({});
  const [thumbnailIndex, setThumbnailIndex] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/products/getProductList", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        setAllProductList(data?.allProducts || []);
      });
  }, []);

  const filteredProducts = allProductList.filter((prod) =>
    prod.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const handleClose = () => setOpen(false);

  const handleThumbnailClick = (productId, image) => {
    setSelectedMainImages((prev) => ({
      ...prev,
      [productId]: image,
    }));
  };

  const handlePrev = (productId) => {
    setThumbnailIndex((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  };

  const handleNext = (productId, imagesLength) => {
    setThumbnailIndex((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 0) + 1, imagesLength - 3),
    }));
  };

  const handleAddToCart = (
    productId,
    productName,
    productPrice,
    originalPrice,
    productCompany,
    productDescription,
    product
  ) => {
    const user_id = localStorage.getItem("user");
    const res = JSON.parse(user_id);

    const formData = new FormData();
    formData.append("product_id", productId);
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("originalPrice", originalPrice);
    formData.append("company", productCompany);
    formData.append("userId", res?.data?._id);
    formData.append("productDescription", productDescription);

    Promise.all(
      product.productImages.map((image, index) =>
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
        return fetch("http://localhost:5000/products/addProductToCart", {
          method: "POST",
          body: formData,
        });
      })
      .then((res) => res.json())
      .then((data) => {
        setRespMsg(data?.msg || "Product added successfully");
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
          <CustomizedInputBase onSearch={setSearchProduct} />
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

      <Grid container spacing={3}>
        {filteredProducts.map((prod) => (
          <Grid item xs={12} sm={6} md={3} key={prod._id}>
            <Paper style={{ borderRadius: "25px", padding: "10px" }}>
              <Box padding={2}>
                <img
                  src={
                    selectedMainImages[prod._id] ||
                    prod.productImages?.[0] ||
                    ""
                  }
                  alt={prod.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "8px",
                  }}
                />
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={1}
                >
                  <Button
                    size="small"
                    onClick={() => handlePrev(prod._id)}
                    disabled={(thumbnailIndex[prod._id] || 0) === 0}
                  >
                    ◀
                  </Button>
                  <Box display="flex" overflow="hidden">
                    {prod.productImages
                      ?.slice(
                        thumbnailIndex[prod._id] || 0,
                        (thumbnailIndex[prod._id] || 0) + 3
                      )
                      .map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          style={{
                            width: "50px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            cursor: "pointer",
                            marginRight: "8px",
                          }}
                          onClick={() => handleThumbnailClick(prod._id, image)}
                        />
                      ))}
                  </Box>
                  <Button
                    size="small"
                    onClick={() =>
                      handleNext(prod._id, prod.productImages.length)
                    }
                    disabled={
                      (thumbnailIndex[prod._id] || 0) >=
                      prod.productImages.length - 3
                    }
                  >
                    ▶
                  </Button>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {prod.name}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {prod.price}
                </Typography>
                <Typography variant="body2" paragraph>
                  {prod.productDescription}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    handleAddToCart(
                      prod._id,
                      prod.name,
                      prod.price,
                      prod.originalPrice,
                      prod.company,
                      prod.productDescription,
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
    </Grid>
  );
};

export default ProductPage;
