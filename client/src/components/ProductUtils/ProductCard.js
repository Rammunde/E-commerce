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
    <Grid item xs={12} sm={6} md={3}>
      <Paper sx={{ borderRadius: "25px", p: 1 }}>
        <Box p={2}>
          <img
            src={
              selectedMainImages[prod._id] ||
              prod.productImages?.[0] ||
              ""
            }
            alt={prod.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "200px",
              borderRadius: "8px",
            }}
          />

          <Box display="flex" justifyContent="center" mt={1}>
            <Button
              size="small"
              onClick={() => handlePrev(prod._id)}
              disabled={(thumbnailIndex[prod._id] || 0) === 0}
            >
              ◀
            </Button>

            <Box display="flex" overflow="hidden">
              {prod.productImages
                ?.slice(
                  thumbnailIndex[prod._id] || 0,
                  (thumbnailIndex[prod._id] || 0) + 3
                )
                .map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    loading="lazy"
                    alt="thumb"
                    onClick={() =>
                      handleThumbnailClick(prod._id, image)
                    }
                    style={{
                      width: "50px",
                      height: "60px",
                      marginRight: "8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  />
                ))}
            </Box>

            <Button
              size="small"
              onClick={() =>
                handleNext(prod._id, prod.productImages.length)
              }
              disabled={
                (thumbnailIndex[prod._id] || 0) >=
                prod.productImages.length - 3
              }
            >
              ▶
            </Button>
          </Box>

          <Typography variant="h6">{prod.name}</Typography>
          <Typography variant="subtitle1">{prod.price}</Typography>

          <Typography variant="body2" paragraph>
            {prod.productDescription}
          </Typography>

          <Button
            variant="contained"
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
