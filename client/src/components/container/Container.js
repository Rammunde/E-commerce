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
import { updateGlobalItemCount } from "../../commonApi";
import { useDispatch } from "react-redux";
import ProductImagesDialog from "../AdminPanel/Products/ProductImagesDialog";

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

  const handleOpenImages = (images) => {
    setSelectedImages(images);
    setOpenImageDialog(true);
  };

  // Get user ID from localStorage
  const getUserId = useCallback(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user)?.data?._id : null;
  }, []);

  // Calculate price details dynamically
  const priceDetails = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const originalTotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
      0
    );
    const discountTotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.discount) || 0) * (item.quantity || 1),
      0
    );
    const finalTotal = originalTotal - discountTotal + PLATFORM_FEE;

    return {
      totalItems,
      originalTotal: originalTotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      platformFee: PLATFORM_FEE,
      deliveryCharge: "Free",
      finalTotal: finalTotal.toFixed(2),
    };
  }, [cartItems]);

  const handleRemove = async (item) => {
    try {
      await fetch(`${API_BASE_URL}/products/removeAddedItems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.product_id,
          userId: item.userId,
        }),
      });
      setSnackbar({
        open: true,
        message: "Item removed from cart",
        severity: "success",
      });
      const userId = getUserId();
      if (userId) {
        updateGlobalItemCount(userId, dispatch);
      }
      getAddedItems();
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
      await fetch(`${API_BASE_URL}/products/IncreaseDecreaseItems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.product_id,
          userId: item.userId,
          price: item.price,
          originalPrice: item.originalPrice,
          plus: isIncrease,
          minus: !isIncrease,
        }),
      });
      const userId = getUserId();
      if (userId) {
        updateGlobalItemCount(userId, dispatch);
      }
      getAddedItems();
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
        updateGlobalItemCount(userId, dispatch);
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
        const price = parseFloat(record.price) || 0;
        const discount = price * 0.1; // 10% discount
        const finalPrice = price - discount;

        return {
          ...record,
          stock: "In Stock",
          delivery: "Free",
          discount: discount.toFixed(2),
          finalPrice: finalPrice.toFixed(2),
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
  }, []);

  useEffect(() => {
    getAddedItems();
    const userId = getUserId();
    if (userId) {
      updateGlobalItemCount(userId, dispatch);
    }
  }, [getAddedItems, getUserId, dispatch]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box p={4}>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h5" mb={2} display="flex" alignItems="center" gap={1}>
        <ShoppingCartIcon /> Your Cart
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
              <Paper elevation={3} key={item._id || item.product_id} sx={{ mb: 2, p: 2 }}>
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
                              width: "60px",
                              height: "60px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                          />

                          {index === 1 && item.productImages.length > 2 && (
                            <Box
                              onClick={() => handleOpenImages(item.productImages)}
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "60px",
                                height: "60px",
                                borderRadius: "8px",
                                background: "rgba(0,0,0,0.6)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
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
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography
                      color={
                        item.stock === "Out of Stock" ? "error" : "success.main"
                      }
                    >
                      {item.stock}
                    </Typography>
                    <Typography variant="body2">
                      Delivery: <b>{item.delivery}</b>
                    </Typography>
                  </Grid>

                  {/* Price and Actions */}
                  <Grid item xs={3}>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      ₹{item.finalPrice}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <s>₹{item.price}</s> ₹{item.discount} Off
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, false)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body1" mx={1}>
                        {item?.quantity || 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, true)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Box display="flex" gap={1} mt={1}>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemove(item)}
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
            <Paper elevation={3} sx={{ p: 2, position: "sticky", top: 20 }}>
              <Typography variant="h6" mb={2}>
                Price Details
              </Typography>
              <Divider />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography>Price ({priceDetails.totalItems} items)</Typography>
                <Typography>₹{priceDetails.originalTotal}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Discount</Typography>
                <Typography color="success.main">- ₹{priceDetails.discountTotal}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Platform Fee</Typography>
                <Typography>₹{priceDetails.platformFee}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Delivery Charges</Typography>
                <Typography color="success.main">{priceDetails.deliveryCharge}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight="bold">Total Amount</Typography>
                <Typography fontWeight="bold">₹{priceDetails.finalTotal}</Typography>
              </Box>
              <Typography color="success.main" mt={1}>
                You will save ₹{priceDetails.discountTotal} on this order
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Place Order"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box >
  );
};

export default Cart;
