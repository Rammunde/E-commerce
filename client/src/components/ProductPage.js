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
      if (!user) {
        setRespMsg("Please login to add products to cart");
        setSeverity("warning");
        setOpen(true);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("product_id", productId);
        formData.append("name", productName);
        formData.append("price", productPrice);
        formData.append("originalPrice", originalPrice);
        formData.append("company", productCompany);
        formData.append("userId", user?.data?._id);
        formData.append("productDescription", productDescription);

        // Fetch and append product images
        await Promise.all(
          product.productImages.map(async (image, index) => {
            const res = await fetch(image);
            const blob = await res.blob();
            formData.append(
              "productImages",
              new File([blob], `image-${index + 1}.jpg`, { type: blob.type })
            );
          })
        );

        const result = await addToCart(formData).unwrap();
        setRespMsg(result?.msg || "Product added successfully");
        setSeverity("success");
        setOpen(true);
      } catch (err) {
        setRespMsg("Failed to add product to the cart");
        setSeverity("error");
        setOpen(true);
      }
    },
    [addToCart]
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Grid container spacing={3} sx={{ px: { xs: 2, md: 4 } }}>
        <Grid container justifyContent="center" mb={4}>
          <Grid item xs={12} sm={8} md={6}>
            <CustomizedInputBase onSearch={setSearchProduct} />
          </Grid>
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

        {/* Error State */}
        {error && (
          <Grid container justifyContent="center" mt={4}>
            <Box textAlign="center" p={4} bgcolor="white" borderRadius="8px" border="1px solid #f0f0f0">
              <Typography color="error" variant="h6" gutterBottom>
                {error.message || "Failed to fetch products"}
              </Typography>
              <Typography color="textSecondary">
                Please check your connection and try refreshing the page
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Empty State */}
        {!isLoading && !error && allProducts.length === 0 && (
          <Grid container justifyContent="center" mt={4}>
            <Box textAlign="center" p={4} bgcolor="white" borderRadius="8px" border="1px solid #f0f0f0">
              <Typography color="textSecondary" variant="h6">
                {searchProduct ? "No products match your search" : "No products available at the moment"}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Product Grid */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Suspense fallback={null}>
              {allProducts.map((prod) => (
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
          </Grid>
        </Grid>

        {/* Load More Button */}
        {!isLoading && data && page < data.totalPages && (
          <Grid container justifyContent="center" mt={6} mb={4}>
            <Button
              variant="contained"
              onClick={loadMoreProducts}
              disabled={isFetching}
              sx={{
                px: 6,
                py: 1,
                borderRadius: '4px',
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 2
              }}
              startIcon={isFetching && <CircularProgress size={20} color="inherit" />}
            >
              {isFetching ? 'Loading Products...' : 'Load More'}
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProductPage;

