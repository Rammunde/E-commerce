import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProductDetailModal = ({ open, onClose, product, onAddToCart }) => {
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return null;

  const images = Array.isArray(product.productImages) && product.productImages.length > 0
    ? product.productImages
    : [];

  const discount =
    product.originalPrice && product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handlePrevImg = () => setActiveImg((p) => Math.max(p - 1, 0));
  const handleNextImg = () => setActiveImg((p) => Math.min(p + 1, images.length - 1));

  const handleAdd = () => {
    onAddToCart(
      product._id,
      product.name,
      product.price,
      product.originalPrice,
      product.company,
      product.productDescription,
      product
    );
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(90deg, #1a237e 0%, #283593 100%)",
          color: "#fff",
          py: 1.5,
          px: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: "80%" }}>
          {product.name}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: 420,
          }}
        >
          {/* ── Image Gallery ── */}
          <Box
            sx={{
              width: { xs: "100%", md: "45%" },
              bgcolor: "#f5f5f5",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              gap: 2,
            }}
          >
            {/* Main image */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              {images.length > 1 && (
                <IconButton
                  onClick={handlePrevImg}
                  disabled={activeImg === 0}
                  size="small"
                  sx={{
                    position: "absolute",
                    left: 4,
                    bgcolor: "rgba(255,255,255,0.85)",
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
                  maxWidth: "90%",
                  maxHeight: "90%",
                  objectFit: "contain",
                  transition: "opacity 0.3s ease",
                }}
              />

              {images.length > 1 && (
                <IconButton
                  onClick={handleNextImg}
                  disabled={activeImg === images.length - 1}
                  size="small"
                  sx={{
                    position: "absolute",
                    right: 4,
                    bgcolor: "rgba(255,255,255,0.85)",
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
                      width: 52,
                      height: 52,
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: idx === activeImg ? "2px solid #1a237e" : "2px solid transparent",
                      cursor: "pointer",
                      transition: "border 0.2s",
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
          </Box>

          {/* ── Product Info ── */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, md: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {/* Brand */}
            {product.company && (
              <Chip
                label={product.company}
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "#e8eaf6",
                  color: "#1a237e",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: 0.5,
                }}
              />
            )}

            {/* Name */}
            <Typography variant="h5" fontWeight={700} color="#212121" lineHeight={1.3}>
              {product.name}
            </Typography>

            {/* Price row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography variant="h4" fontWeight={800} color="#1a237e">
                ₹{product.price}
              </Typography>
              {product.originalPrice && product.originalPrice !== product.price && (
                <>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through" }}
                  >
                    ₹{product.originalPrice}
                  </Typography>
                  {discount > 0 && (
                    <Chip
                      label={`${discount}% OFF`}
                      size="small"
                      sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 }}
                    />
                  )}
                </>
              )}
            </Box>

            <Divider />

            {/* Description */}
            {product.productDescription && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#555" mb={0.5}>
                  Description
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7, maxHeight: 120, overflowY: "auto" }}
                >
                  {product.productDescription}
                </Typography>
              </Box>
            )}

            {/* Category / extra info */}
            {product.category && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Category:
                </Typography>
                <Chip label={product.category} size="small" variant="outlined" />
              </Box>
            )}

            {/* Spacer */}
            <Box sx={{ flex: 1 }} />

            {/* CTA */}
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAdd}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(90deg, #1a237e 0%, #3949ab 100%)",
                boxShadow: "0 4px 16px rgba(26,35,126,0.35)",
                "&:hover": {
                  background: "linear-gradient(90deg, #0d1b6e 0%, #283593 100%)",
                  boxShadow: "0 6px 20px rgba(26,35,126,0.45)",
                },
              }}
            >
              Add to Cart
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
