import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import {
  Grid,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useGetProductsQuery, useAddToCartMutation } from "../redux/apiSlice";
import CustomizedInputBase from "../components/ProductUtils/CustomizedInputBase";

const ProductCard = lazy(() =>
  import("../components/ProductUtils/ProductCard")
);

const ProductPage = () => {
  const dispatch = useDispatch();

  const [respMsg, setRespMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedMainImages, setSelectedMainImages] = useState({});
  const [thumbnailIndex, setThumbnailIndex] = useState({});
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const ITEMS_PER_PAGE = 8;

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchProduct);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchProduct]);

  /* ---------------- RTK QUERY ---------------- */
  const { data, isLoading, isFetching, error } = useGetProductsQuery({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
  });

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  useEffect(() => {
    if (data?.allProducts) {
      if (page === 1) {
        setAllProducts(data.allProducts);
      } else {
        setAllProducts((prev) => [...prev, ...data.allProducts]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadMoreProducts = () => {
    if (data && page < data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  /* ---------------- HANDLERS ---------------- */
  const handleClose = useCallback(() => setOpen(false), []);

  const handleThumbnailClick = useCallback((productId, image) => {
    setSelectedMainImages((prev) => ({
      ...prev,
      [productId]: image,
    }));
  }, []);

  const handlePrev = useCallback((productId) => {
    setThumbnailIndex((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  }, []);

  const handleNext = useCallback((productId, imagesLength) => {
    setThumbnailIndex((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 0) + 1, imagesLength - 3),
    }));
  }, []);

  const handleAddToCart = useCallback(
    async (
      productId,
      productName,
      productPrice,
      originalPrice,
      productCompany,
      productDescription,
      product
    ) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

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
          console.log(data);
        })
        .catch((err) => {
          setRespMsg("Failed to add product to the cart");
          setIsError(true);
          console.error("Error:", err)
        });
    })

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
    return (<>
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

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading || isAddingToCart}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%", borderRadius: '8px', boxShadow: 3 }}>
          {respMsg}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Suspense fallback={null}>
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod._id}
              prod={prod}
              selectedMainImages={selectedMainImages}
              thumbnailIndex={thumbnailIndex}
              handlePrev={handlePrev}
              handleNext={handleNext}
              handleThumbnailClick={handleThumbnailClick}
              handleAddToCart={handleAddToCart}
            />
          ))}
        </Suspense>
      </Grid></>)
  };
}
export default ProductPage;
