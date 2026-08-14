import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Box,
    Typography,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Snackbar,
    Breadcrumbs,
    Link,
    IconButton,
    Paper,
    Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useGetProductByIdQuery, useAddToCartMutation } from "../redux/apiSlice";

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.app.user);

    const [activeImg, setActiveImg] = useState(0);
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");
    const [snackSeverity, setSnackSeverity] = useState("success");
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const { data, isLoading, isError } = useGetProductByIdQuery(id, { skip: !id });
    const [addToCart] = useAddToCartMutation();

    const product = data?.product;
    const images = Array.isArray(product?.productImages) ? product.productImages : [];

    const basePrice = Number(
        product?.originalPrice && Number(product?.originalPrice) > Number(product?.price) && !product?.discountPercentage
            ? product.originalPrice
            : product?.price
    ) || 0;

    let discountPercentage = Number(product?.discountPercentage) || 0;
    if (!discountPercentage && product?.originalPrice && Number(product?.originalPrice) > Number(product?.price)) {
        discountPercentage = Math.round(
            ((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100
        );
    }

    const hasDiscount = discountPercentage > 0 && discountPercentage <= 100;
    const discountAmount = hasDiscount ? Math.round((basePrice * discountPercentage) / 100) : 0;
    const sellingPrice = hasDiscount ? basePrice - discountAmount : basePrice;

    const base64ToFile = useCallback((base64String, filename) => {
        if (!base64String) return null;
        const [header, data] = base64String.split(",");
        const mimeMatch = header?.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const binary = atob(data || "");
        const array = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new File([array], filename, { type: mime });
    }, []);

    const handleAddToCart = useCallback(async () => {
        try {
            setIsAddingToCart(true);
            const loggedInUser = user?.data || user;

            if (!loggedInUser?._id) {
                setSnackMsg("Please log in before adding items to the cart.");
                setSnackSeverity("error");
                setSnackOpen(true);
                return;
            }

            const formData = new FormData();
            formData.append("product_id", product._id);
            formData.append("name", product.name);
            formData.append("price", product.price);
            formData.append("originalPrice", product.price);
            formData.append("discountPercentage", product.discountPercentage || 0);
            formData.append("company", product.company || "");
            formData.append("userId", loggedInUser._id);
            formData.append("productDescription", product.productDescription || "");

            images.forEach((image, index) => {
                if (typeof image === "string" && image.startsWith("data:")) {
                    const file = base64ToFile(image, `product_${product._id}_image_${index}.jpg`);
                    if (file) formData.append("productImages", file);
                }
            });

            const responseData = await addToCart(formData).unwrap();
            setSnackMsg(responseData?.msg || "Product added successfully.");
            setSnackSeverity(responseData?.error ? "error" : "success");
            setSnackOpen(true);
        } catch (err) {
            console.error("Error adding to cart:", err);
            setSnackMsg("Something went wrong while adding to cart.");
            setSnackSeverity("error");
            setSnackOpen(true);
        } finally {
            setIsAddingToCart(false);
        }
    }, [product, user, images, addToCart, base64ToFile]);

    /* ── Loading skeleton ── */
    if (isLoading) {
        return (
            <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1100, mx: "auto" }}>
                <Skeleton variant="rectangular" width={200} height={24} sx={{ mb: 3, borderRadius: 1 }} />
                <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
                    <Skeleton variant="rectangular" width="45%" height={400} sx={{ borderRadius: 3 }} />
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <Skeleton variant="text" width="60%" height={40} />
                        <Skeleton variant="text" width="30%" height={32} />
                        <Skeleton variant="text" width="80%" height={20} />
                        <Skeleton variant="text" width="75%" height={20} />
                        <Skeleton variant="rectangular" width="100%" height={52} sx={{ borderRadius: 2, mt: 2 }} />
                    </Box>
                </Box>
            </Box>
        );
    }

    /* ── Error ── */
    if (isError || !product) {
        return (
            <Box sx={{ p: 5, textAlign: "center" }}>
                <Alert severity="error" sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
                    Product not found or failed to load.
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/product")}
                >
                    Back to Products
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
                py: { xs: 2, md: 4 },
                px: { xs: 2, md: 5 },
                fontFamily: "Roboto, sans-serif",
            }}
        >
            <Box sx={{ maxWidth: 1100, mx: "auto" }}>
                {/* ── Breadcrumb ── */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 2 }}
                >
                    <Link
                        underline="hover"
                        color="primary"
                        sx={{ cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}
                        onClick={() => navigate("/product")}
                    >
                        Products
                    </Link>
                    <Typography
                        color="text.primary"
                        fontSize="0.85rem"
                        fontWeight={600}
                        noWrap
                        sx={{ maxWidth: 260 }}
                    >
                        {product.name}
                    </Typography>
                </Breadcrumbs>

                {/* ── Back button ── */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    size="small"
                    sx={{
                        mb: 2,
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        "&:hover": { bgcolor: "action.hover" },
                    }}
                >
                    Back
                </Button>

                {/* ── Main Content ── */}
                <Paper
                    elevation={2}
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        borderRadius: "4px",
                        overflow: "hidden",
                    }}
                >
                    {/* ── Left: Image Gallery ── */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "42%" },
                            bgcolor: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                            p: 3,
                            borderRight: { md: "1px solid #f0f0f0" },
                        }}
                    >
                        {/* Main image */}
                        <Box
                            sx={{
                                width: "100%",
                                height: { xs: 260, md: 360 },
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#fafafa",
                                borderRadius: "4px",
                                overflow: "hidden",
                                border: "1px solid #f0f0f0",
                            }}
                        >
                            {images.length > 1 && (
                                <IconButton
                                    onClick={() => setActiveImg((p) => Math.max(p - 1, 0))}
                                    disabled={activeImg === 0}
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        left: 6,
                                        bgcolor: "rgba(255,255,255,0.9)",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                                        "&:hover": { bgcolor: "#fff" },
                                        zIndex: 1,
                                    }}
                                >
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </IconButton>
                            )}

                            <img
                                src={images[activeImg] || ""}
                                alt={product.name}
                                style={{
                                    maxWidth: "85%",
                                    maxHeight: "85%",
                                    objectFit: "contain",
                                    transition: "opacity 0.2s ease",
                                }}
                            />

                            {images.length > 1 && (
                                <IconButton
                                    onClick={() => setActiveImg((p) => Math.min(p + 1, images.length - 1))}
                                    disabled={activeImg === images.length - 1}
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        right: 6,
                                        bgcolor: "rgba(255,255,255,0.9)",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                                        "&:hover": { bgcolor: "#fff" },
                                        zIndex: 1,
                                    }}
                                >
                                    <ArrowForwardIosIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                                {images.map((img, idx) => (
                                    <Box
                                        key={idx}
                                        onClick={() => setActiveImg(idx)}
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: "4px",
                                            overflow: "hidden",
                                            border: idx === activeImg
                                                ? "2px solid"
                                                : "2px solid #e0e0e0",
                                            borderColor: idx === activeImg ? "primary.main" : "#e0e0e0",
                                            cursor: "pointer",
                                            transition: "border-color 0.15s",
                                            bgcolor: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`thumb-${idx}`}
                                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {images.length > 1 && (
                            <Typography variant="caption" color="text.secondary">
                                {activeImg + 1} / {images.length}
                            </Typography>
                        )}

                        {/* Add to Cart — prominent on mobile */}
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            size="large"
                            startIcon={
                                isAddingToCart
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <ShoppingCartIcon />
                            }
                            disabled={isAddingToCart}
                            onClick={handleAddToCart}
                            sx={{
                                display: { xs: "flex", md: "none" },
                                py: 1.5,
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                borderRadius: "4px",
                            }}
                        >
                            {isAddingToCart ? "Adding..." : "Add to Cart"}
                        </Button>
                    </Box>

                    {/* ── Right: Product Info ── */}
                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 2, md: 4 },
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            bgcolor: "#fff",
                        }}
                    >
                        {/* Brand */}
                        {product.company && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={600}
                                sx={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 0.5 }}
                            >
                                {product.company}
                            </Typography>
                        )}

                        {/* Name */}
                        <Typography
                            variant="h5"
                            component="h1"
                            fontWeight={700}
                            color="text.primary"
                            lineHeight={1.3}
                        >
                            {product.name}
                        </Typography>

                        <Divider />

                        {/* Price */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color="text.primary"
                                sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}
                            >
                                ₹{sellingPrice}
                            </Typography>

                            {hasDiscount && (
                                <>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{ textDecoration: "line-through" }}
                                    >
                                        ₹{basePrice}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight={700}
                                        color="success.main"
                                    >
                                        {discountPercentage}% OFF
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {/* Savings callout */}
                        {hasDiscount && (
                            <Typography
                                variant="body2"
                                color="success.main"
                                fontWeight={600}
                            >
                                You save ₹{discountAmount} on this product!
                            </Typography>
                        )}

                        <Divider />

                        {/* Description */}
                        {product.productDescription && (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    color="text.primary"
                                    mb={0.5}
                                >
                                    About this product
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ lineHeight: 1.8 }}
                                >
                                    {product.productDescription}
                                </Typography>
                            </Box>
                        )}

                        {/* Category */}
                        {product.category && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                    Category:
                                </Typography>
                                <Chip label={product.category} size="small" variant="outlined" />
                            </Box>
                        )}

                        <Box sx={{ flex: 1 }} />

                        {/* CTA — desktop */}
                        <Box
                            sx={{
                                display: { xs: "none", md: "flex" },
                                gap: 2,
                                flexWrap: "wrap",
                                mt: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                startIcon={
                                    isAddingToCart
                                        ? <CircularProgress size={18} color="inherit" />
                                        : <ShoppingCartIcon />
                                }
                                disabled={isAddingToCart}
                                onClick={handleAddToCart}
                                sx={{
                                    minWidth: 180,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    borderRadius: "4px",
                                }}
                            >
                                {isAddingToCart ? "Adding..." : "Add to Cart"}
                            </Button>

                            <Button
                                variant="outlined"
                                color="primary"
                                size="large"
                                onClick={() => navigate("/product")}
                                sx={{
                                    minWidth: 180,
                                    py: 1.5,
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    borderRadius: "4px",
                                }}
                            >
                                Continue Shopping
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackOpen(false)}
                    severity={snackSeverity}
                    sx={{ width: "100%", borderRadius: 2 }}
                >
                    {snackMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductDetailPage;
