import React from "react";
import {
  Grid,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  prod,
  selectedMainImages,
  handleAddToCart,
}) => {
  const navigate = useNavigate();

  const handleView = () => navigate(`/product/detail/${prod._id}`);

  // Base price (original price)
  const basePrice = Number(
    prod.originalPrice && Number(prod.originalPrice) > Number(prod.price) && !prod.discountPercentage
      ? prod.originalPrice
      : prod.price
  ) || 0;

  // Discount percentage (explicit field or fallback calculation from originalPrice)
  let discountPercentage = Number(prod.discountPercentage) || 0;
  if (!discountPercentage && prod.originalPrice && Number(prod.originalPrice) > Number(prod.price)) {
    discountPercentage = Math.round(
      ((Number(prod.originalPrice) - Number(prod.price)) / Number(prod.originalPrice)) * 100
    );
  }

  const hasDiscount = discountPercentage > 0 && discountPercentage <= 100;
  const discountAmount = hasDiscount ? Math.round((basePrice * discountPercentage) / 100) : 0;
  let sellingPrice = hasDiscount ? basePrice - discountAmount : basePrice;
  sellingPrice = Number(sellingPrice).toFixed(2);

  return (
    <Grid item xs={12} sm={6} md={3} lg={2.4}>
      <Paper
        elevation={1}
        sx={{
          borderRadius: "4px",
          p: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.2s ease",
          position: "relative",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          },
        }}
      >
        {/* Image area with View overlay on hover */}
        <Box
          sx={{
            p: 1,
            position: "relative",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fff",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0",
            overflow: "hidden",
            // "&:hover .view-overlay": { opacity: 1 },
          }}
          onClick={handleView}
        >
          {/* Discount badge on top-left of image */}
          {/* {hasDiscount && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                bgcolor: "success.main",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.7rem",
                px: 0.8,
                py: 0.25,
                borderRadius: "3px",
                zIndex: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              {discountPercentage}% OFF
            </Box>
          )} */}

          <img
            src={selectedMainImages[prod._id] || prod.productImages?.[0] || ""}
            alt={prod.name}
            loading="lazy"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />

          {/* Hover overlay */}
          <Box
            className="view-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(40, 116, 240, 0.55)", // primary.main @ 55%
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                color: "#fff",
              }}
            >
              <VisibilityIcon sx={{ fontSize: 28 }} />
              <Typography variant="caption" fontWeight={700} color="#fff" fontSize="0.75rem">
                View Details
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{ p: 1.5, flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          {/* Brand */}
          {prod.company && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.4 }}
            >
              {prod.company}
            </Typography>
          )}

          {/* Name */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              color: "text.primary",
              cursor: "pointer",
              fontSize: "0.85rem",
              lineHeight: 1.4,
              "&:hover": { color: "primary.main" },
            }}
            onClick={handleView}
          >
            {prod.name}
          </Typography>

          {/* Price row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1, flexWrap: "wrap" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              ₹{sellingPrice}
            </Typography>
            {hasDiscount && (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ₹{basePrice}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "success.main", fontWeight: 700 }}
                >
                  {discountPercentage}% OFF
                </Typography>
              </>
            )}
          </Box>

          {/* Action row */}
          <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: "4px",
                py: 0.75,
                fontSize: "0.8rem",
              }}
              onClick={() =>
                handleAddToCart(
                  prod._id,
                  prod.name,
                  prod.price,
                  prod.discountPercentage || 0,
                  prod.company,
                  prod.productDescription,
                  prod
                )
              }
            >
              Add to Cart
            </Button>

            <Tooltip title="View Details" arrow>
              <IconButton
                size="small"
                onClick={handleView}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "4px",
                  px: 1,
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    borderColor: "primary.main",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );
};

export default React.memo(ProductCard);
