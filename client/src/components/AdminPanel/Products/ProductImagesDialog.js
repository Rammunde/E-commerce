import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Fade,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const ProductImagesDialog = ({ open, images = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 === images.length ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length]);

  if (!images.length) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      // maxWidth="lg"
      fullWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          px: 3,
          py: 2,
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Product Gallery
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', bgcolor: '#f5f5f5', px: 1, py: 0.2, borderRadius: 1 }}>
            {currentIndex + 1} / {images.length}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
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
          p: 0,
          minHeight: 450,
          overflow: 'hidden'
        }}
      >
        {/* NAVIGATION ARROWS */}
        {images.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 16,
                zIndex: 2,
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: '#fff' },
                boxShadow: 2
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 16,
                zIndex: 2,
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: '#fff' },
                boxShadow: 2
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </>
        )}

        <Fade in={true} key={currentIndex} timeout={400}>
          <Box
            component="img"
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            sx={{
              maxWidth: "100%",
              maxHeight: 700,
              objectFit: 'contain',
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          />
        </Fade>
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
            alt={`Thumbnail ${index + 1}`}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 80,
              height: 80,
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
    </Dialog>
  );
};

export default ProductImagesDialog;
