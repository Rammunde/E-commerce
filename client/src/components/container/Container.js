import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useDispatch } from "react-redux";
import { useRemoveFromCartMutation, useUpdateCartQuantityMutation } from "../../redux/apiSlice";
import ProductImagesDialog from "../AdminPanel/Products/ProductImagesDialog";
import { useSelector } from "react-redux";

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Platform fee constant
const PLATFORM_FEE = 3;

const Cart = () => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const user = useSelector((state) => state.app.user);

  const handleOpenImages = (images) => {
    setSelectedImages(images);
    setOpenImageDialog(true);
  };

  // Get user ID from state / localStorage
  const getUserId = useCallback(() => {
    const loggedInUser = user?.data || user;
    return loggedInUser?._id;
  }, [user]);

  // Calculate price details dynamically
  const priceDetails = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const originalTotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.originalPrice || item.price) || 0) * (item.quantity || 1),
      0
    );
    const discountTotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.discountAmount) || 0) * (item.quantity || 1),
      0
    );
    const finalTotal = cartItems.length > 0 ? originalTotal - discountTotal + PLATFORM_FEE : 0;

    return {
      totalItems,
      originalTotal: originalTotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      platformFee: PLATFORM_FEE,
      deliveryCharge: "Free",
      finalTotal: finalTotal.toFixed(2),
    };
  }, [cartItems]);

  const [removeFromCart] = useRemoveFromCartMutation();
  const [updateCartQuantity] = useUpdateCartQuantityMutation();

  const handleRemove = async (item) => {
    try {
      await removeFromCart({
        product_id: item.product_id,
        userId: item.userId,
      }).unwrap();

      setSnackbar({
        open: true,
        message: "Item removed from cart",
        severity: "success",
      });

      await getAddedItems();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to remove item",
        severity: "error",
      });
    }
  };

  const handleQuantityChange = async (item, isIncrease) => {
    try {
      await updateCartQuantity({
        product_id: item.product_id,
        userId: item.userId,
        price: item.price,
        originalPrice: item.originalPrice,
        plus: isIncrease,
        minus: !isIncrease,
      }).unwrap();

      await getAddedItems();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update quantity",
        severity: "error",
      });
    }
  };

  const handlePlaceOrder = async () => {
    const userId = getUserId();
    if (!userId) {
      setSnackbar({
        open: true,
        message: "Please login to place an order",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/placeOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (!data.err) {
        setSnackbar({
          open: true,
          message: "Order placed successfully! Check your email.",
          severity: "success",
        });
        setCartItems([]);
      } else {
        throw new Error(data.msg || "Failed to place order");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to place order",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAddedItems = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/getAddedItems/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      const updatedResult = (data.result || []).map((record) => {
        const originalPrice = parseFloat(record.price || record.originalPrice) || 0;
        const discountPercentage = Math.min(100, Math.max(0, parseFloat(record.discountPercentage) || 0));
        const discountAmount = discountPercentage > 0 ? (originalPrice * discountPercentage) / 100 : 0;
        const sellingPrice = originalPrice - discountAmount;

        return {
          ...record,
          stock: "In Stock",
          delivery: "Free",
          originalPrice,
          discountPercentage,
          discountAmount,
          sellingPrice,
          finalPrice: sellingPrice,
        };
      });
      setCartItems(updatedResult);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to load cart items",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  useEffect(() => {
    getAddedItems();
  }, [getAddedItems]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh", fontFamily: "Roboto, sans-serif" }}>
      <ProductImagesDialog
        open={openImageDialog}
        images={selectedImages}
        onClose={() => setOpenImageDialog(false)}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ borderRadius: "4px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h5" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1} color="text.primary">
        <ShoppingCartIcon color="primary" /> Your Cart
      </Typography>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      ) : cartItems.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Add items to your cart to see them here
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Paper elevation={1} key={item._id || item.product_id} sx={{ mb: 2, p: 2, borderRadius: "4px" }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Product Image */}
                  <Grid item xs={3}>
                    <Box display="flex" gap={1}>
                      {item?.productImages?.slice(0, 2).map((img, index) => (
                        <Box key={index} position="relative">
                          <img
                            src={img}
                            alt={`${item.name}-${index}`}
                            onClick={() => handleOpenImages(item.productImages)}
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "4px",
                              objectFit: "contain",
                              cursor: "pointer",
                              border: "1px solid #f0f0f0",
                            }}
                          />

                          {index === 1 && item.productImages.length > 2 && (
                            <Box
                              onClick={() => handleOpenImages(item.productImages)}
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "64px",
                                height: "64px",
                                borderRadius: "4px",
                                background: "rgba(0,0,0,0.55)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                              }}
                            >
                              +{item.productImages.length - 2}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Grid>

                  {/* Product Details */}
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={item.stock === "Out of Stock" ? "error" : "success.main"}
                    >
                      {item.stock}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Delivery: <b>{item.delivery}</b>
                    </Typography>
                  </Grid>

                  {/* Price and Actions */}
                  <Grid item xs={3}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ fontSize: "0.95rem" }}>
                      ₹{(item.sellingPrice * (item.quantity || 1)).toFixed(2)}
                    </Typography>
                    {item.discountPercentage > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        <s>₹{(item.originalPrice * (item.quantity || 1)).toFixed(2)}</s>{" "}
                        <span style={{ color: "#388e3c", fontWeight: 600 }}>
                          {item.discountPercentage}% OFF
                        </span>
                      </Typography>
                    )}
                    <Box display="flex" alignItems="center" mt={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, false)}
                        disabled={item.quantity <= 1}
                        sx={{ border: "1px solid #e0e0e0", borderRadius: "4px", p: 0.25 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" fontWeight={600} mx={1.5}>
                        {item?.quantity || 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, true)}
                        sx={{ border: "1px solid #e0e0e0", borderRadius: "4px", p: 0.25 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box display="flex" gap={1} mt={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemove(item)}
                        sx={{ borderRadius: "4px", fontWeight: 600, fontSize: "0.75rem" }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>

          {/* Price Details */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, position: "sticky", top: 20, borderRadius: "4px" }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={2}>
                Price Details
              </Typography>
              <Divider />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="body2" color="text.secondary">Price ({priceDetails.totalItems} items)</Typography>
                <Typography variant="body2" fontWeight={500}>₹{priceDetails.originalTotal}</Typography>
              </Box>
              {Number(priceDetails.discountTotal) > 0 && (
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>- ₹{priceDetails.discountTotal}</Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="body2" color="text.secondary">Platform Fee</Typography>
                <Typography variant="body2" fontWeight={500}>₹{priceDetails.platformFee}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="body2" color="text.secondary">Delivery Charges</Typography>
                <Typography variant="body2" color="success.main" fontWeight={600}>{priceDetails.deliveryCharge}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={700}>Total Amount</Typography>
                <Typography variant="body1" fontWeight={700}>₹{priceDetails.finalTotal}</Typography>
              </Box>
              {Number(priceDetails.discountTotal) > 0 && (
                <Typography variant="body2" color="success.main" fontWeight={600} mt={1}>
                  You will save ₹{priceDetails.discountTotal} on this order
                </Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 2.5, borderRadius: "4px", fontWeight: 700, fontSize: "0.95rem", py: 1.5 }}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Place Order"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Cart;
