import React from "react";
import {
  Grid,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";

const ProductCard = ({
  prod,
  selectedMainImages,
  thumbnailIndex,
  handlePrev,
  handleNext,
  handleThumbnailClick,
  handleAddToCart,
}) => {
  return (
    <Grid item xs={12} sm={6} md={3} lg={2.4}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "8px",
          p: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          border: '1px solid #f0f0f0',
          '&:hover': {
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ p: 1, position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
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
        </Box>

        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              color: '#212121'
            }}
          >
            {prod.name}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {prod.productDescription}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              ₹{prod.price}
            </Typography>
            {prod.originalPrice && (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'line-through', fontSize: '0.85rem' }}
                >
                  ₹{prod.originalPrice}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#388e3c', fontWeight: 700 }}
                >
                  {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% off
                </Typography>
              </>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            size="small"
            sx={{
              mt: 'auto',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '4px',
              py: 1
            }}
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
  );
};

export default React.memo(ProductCard);
