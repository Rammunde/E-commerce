import React, {
  useState,
  useEffect,
  useMemo,
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
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateGlobalItemCount } from "../commonApi";
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
  const [allProductList, setAllProductList] = useState([]);
  const [selectedMainImages, setSelectedMainImages] = useState({});
  const [thumbnailIndex, setThumbnailIndex] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5000/products/getProductList")
      .then((resp) => resp.json())
      .then((data) => {
        setAllProductList(data?.allProducts || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  /* ---------------- FILTER PRODUCTS ---------------- */
  const filteredProducts = useMemo(() => {
    return allProductList.filter((prod) =>
      prod.name.toLowerCase().includes(searchProduct.toLowerCase())
    );
  }, [allProductList, searchProduct]);

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
      [productId]: Math.min(
        (prev[productId] || 0) + 1,
        imagesLength - 3
      ),
    }));
  }, []);

  const handleAddToCart = useCallback(
    (
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
      formData.append("product_id", productId);
      formData.append("name", productName);
      formData.append("price", productPrice);
      formData.append("originalPrice", originalPrice);
      formData.append("company", productCompany);
      formData.append("userId", user?.data?._id);
      formData.append("productDescription", productDescription);

      Promise.all(
        product.productImages.map((image, index) =>
          fetch(image)
            .then((res) => res.blob())
            .then((blob) =>
              formData.append(
                "productImages",
                new File([blob], `image-${index + 1}.jpg`, {
                  type: blob.type,
                })
              )
            )
        )
      )
        .then(() =>
          fetch("http://localhost:5000/products/addProductToCart", {
            method: "POST",
            body: formData,
          })
        )
        .then((res) => res.json())
        .then((data) => {
          setRespMsg(data?.msg || "Product added successfully");
          updateGlobalItemCount(user?.data?._id, dispatch);
          setSeverity("success");
          setOpen(true);
        })
        .catch(() => {
          setRespMsg("Failed to add product to the cart");
          setSeverity("error");
          setOpen(true);
        });
    },
    [dispatch]
  );

  return (
    <Grid container spacing={3} padding={3}>
      <Grid container justifyContent="center" mt={3} mb={2}>
        <Grid item xs={12} sm={8}>
          <CustomizedInputBase onSearch={setSearchProduct} />
        </Grid>
      </Grid>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
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
      </Grid>
    </Grid>
  );
};

export default ProductPage;
