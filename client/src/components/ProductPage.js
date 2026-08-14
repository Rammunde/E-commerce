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
import { useSelector } from "react-redux";
import { useGetProductsQuery, useAddToCartMutation } from "../redux/apiSlice";
import CustomizedInputBase from "../components/ProductUtils/CustomizedInputBase";

const ProductCard = lazy(() =>
  import("../components/ProductUtils/ProductCard")
);

const ProductPage = () => {
  const [respMsg, setRespMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedMainImages, setSelectedMainImages] = useState({});
  const [thumbnailIndex, setThumbnailIndex] = useState({});
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const user = useSelector((state) => state.app.user);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchProduct);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchProduct]);

  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
  });

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

  const handleClose = useCallback(() => setOpen(false), []);

  const base64ToFile = useCallback((base64String, filename) => {
    if (!base64String) return null;
    const [header, data] = base64String.split(",");
    const mimeMatch = header?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const binary = atob(data || "");
    const array = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new File([array], filename, { type: mime });
  }, []);

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

  const [addToCart] = useAddToCartMutation();

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
      try {
        setIsAddingToCart(true);

        const loggedInUser = user?.data || user;

        if (!loggedInUser?._id) {
          setRespMsg("Please log in before adding items to the cart.");
          setSeverity("error");
          setIsError(true);
          setOpen(true);
          return;
        }

        const formData = new FormData();
        formData.append("product_id", productId);
        formData.append("name", productName);
        formData.append("price", productPrice);
        formData.append("originalPrice", productPrice);
        formData.append("discountPercentage", product?.discountPercentage || 0);
        formData.append("company", productCompany || product?.company || "");
        formData.append("userId", loggedInUser._id);
        formData.append(
          "productDescription",
          productDescription || product?.productDescription || ""
        );

        const productImages = Array.isArray(product?.productImages)
          ? product.productImages
          : [];

        productImages.forEach((image, index) => {
          if (typeof image === "string" && image.startsWith("data:")) {
            const file = base64ToFile(image, `product_${productId}_image_${index}.jpg`);
            if (file) {
              formData.append("productImages", file);
            }
          }
        });

        const responseData = await addToCart(formData).unwrap();

        setRespMsg(responseData?.msg || "Product added successfully.");
        setSeverity(responseData?.error ? "error" : "success");
        setIsError(Boolean(responseData?.error));
        setOpen(true);
      } catch (error) {
        console.error("Error adding product to cart:", error);

        setRespMsg("Something went wrong while adding the product to the cart.");
        setSeverity("error");
        setIsError(true);
        setOpen(true);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [user, addToCart]
  );

  useEffect(() => {
    if (!respMsg) return;

    const timer = setTimeout(() => {
      setOpen(false);
      setRespMsg("");
      setIsError(false);
    }, severity === "error" ? 10000 : 7000);

    return () => clearTimeout(timer);
  }, [respMsg, severity]);

  const filteredProducts = allProducts;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="center" mb={2}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            Products
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomizedInputBase onSearch={setSearchProduct} />
        </Grid>
      </Grid>
      {/* 
      {respMsg && (
        <Alert
          severity={severity}
          onClose={handleClose}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {respMsg}
        </Alert>
      )} */}

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading || isAddingToCart}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={3}>
        <Suspense fallback={<CircularProgress />}>
          {filteredProducts?.length > 0 ? (
            filteredProducts.map((prod) => (
              <ProductCard
                key={prod._id || prod.id}
                prod={prod}
                selectedMainImages={selectedMainImages}
                handleAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" color="textSecondary">
                {isLoading ? "Loading products..." : "No products found."}
              </Typography>
            </Grid>
          )}
        </Suspense>
      </Grid>

      {data?.totalPages > page && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button variant="contained" onClick={loadMoreProducts} disabled={isFetching}>
            Load More
          </Button>
        </Box>
      )}

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%", borderRadius: 2 }}>
          {respMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductPage;
