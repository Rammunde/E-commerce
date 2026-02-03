import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ProductImagesDialog = ({ open, images = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  if (!images.length) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm" // ms, lg to increase the size of the modal
      fullWidth={false} // make it to true
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        Product Images
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* MAIN IMAGE */}
      <DialogContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          bgcolor: "#f9fafb",
          minHeight: 320,
        }}
      >

        <Box
          component="img"
          src={images[currentIndex]}
          alt="product"
          sx={{
            maxWidth: "100%",
            maxHeight: 360,
            borderRadius: 2,
            boxShadow: 3,
            transition: "transform 0.3s",
            "&:hover": { transform: "scale(1.03)" },
          }}
        />
      </DialogContent>

      {/* THUMBNAILS */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 2,
          overflowX: "auto",
          justifyContent: "center",
          bgcolor: "#fff",
        }}
      >
        {images.map((img, index) => (
          <Box
            key={index}
            component="img"
            src={img}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 70,
              height: 70,
              objectFit: "cover",
              borderRadius: 1,
              cursor: "pointer",
              border:
                index === currentIndex
                  ? "2px solid #1976d2"
                  : "1px solid #ddd",
              opacity: index === currentIndex ? 1 : 0.6,
              transition: "all 0.2s",
              "&:hover": {
                opacity: 1,
                transform: "scale(1.05)",
              },
            }}
          />
        ))}
      </Box>

      {/* FOOTER */}
      {/* <DialogActions
        sx={{
          justifyContent: "space-between",
          px: 3,
        }}
      >
        <span>
          {currentIndex + 1} / {images.length}
        </span>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default ProductImagesDialog;
