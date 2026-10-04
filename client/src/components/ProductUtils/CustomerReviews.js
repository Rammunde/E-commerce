import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Rating,
  Button,
  TextField,
  Divider,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Alert,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { useSelector } from "react-redux";
import {
  useGetProductReviewsQuery,
  useAddProductReviewMutation,
  useDeleteProductReviewMutation,
} from "../../redux/apiSlice";

const CustomerReviews = ({ productId }) => {
  const user = useSelector((state) => state.app.user);
  const loggedInUser = user?.data || user;

  const { data, isLoading } = useGetProductReviewsQuery(productId, { skip: !productId });
  const [addReview, { isLoading: isSubmitting }] = useAddProductReviewMutation();
  const [deleteReview] = useDeleteProductReviewMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState(
    loggedInUser?.fullName || (loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : "")
  );
  const [errorMsg, setErrorMsg] = useState("");

  const reviews = data?.reviews || [];
  const averageRating = data?.averageRating || 0;
  const totalReviews = data?.totalReviews || 0;

  const handleOpen = () => {
    setErrorMsg("");
    setRating(5);
    setTitle("");
    setComment("");
    setAuthorName(
      loggedInUser?.fullName || (loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : "")
    );
    setOpenDialog(true);
  };

  const handleClose = () => setOpenDialog(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg("Please enter your review feedback.");
      return;
    }

    try {
      await addReview({
        productId,
        rating,
        title,
        comment,
        userName: authorName.trim() || "Verified Buyer",
        userId: loggedInUser?._id || null,
        verifiedPurchase: true,
      }).unwrap();

      handleClose();
    } catch (err) {
      console.error("Failed to add review:", err);
      setErrorMsg(err?.data?.msg || "Failed to submit review. Please try again.");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview({ productId, reviewId }).unwrap();
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Reviews Summary & Add Action Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Customer Reviews ({totalReviews})
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Rating value={averageRating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" fontWeight={700}>
              {averageRating.toFixed(1)} out of 5
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({totalReviews} global rating{totalReviews === 1 ? '' : 's'})
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<RateReviewIcon />}
          onClick={handleOpen}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5, px: 2.5 }}
        >
          Write a Review
        </Button>
      </Paper>

      {/* Review List */}
      {reviews.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {reviews.map((rev) => {
            const isAuthor = loggedInUser?._id && rev.userId === loggedInUser._id;
            const isAdmin = loggedInUser?.role === "Admin";
            const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

            return (
              <Paper
                key={rev._id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#ffffff",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.light", fontSize: "0.85rem", fontWeight: 700 }}>
                      {(rev.userName || "U")[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {rev.userName || "Anonymous"}
                        </Typography>
                        {rev.verifiedPurchase && (
                          <Chip
                            icon={<VerifiedIcon sx={{ fontSize: "14px !important", color: "success.main" }} />}
                            label="Verified Purchase"
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.68rem", borderColor: "success.light" }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Reviewed on {dateStr}
                      </Typography>
                    </Box>
                  </Box>

                  {(isAuthor || isAdmin) && (
                    <IconButton size="small" color="error" onClick={() => handleDelete(rev._id)} title="Delete Review">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 1.2 }}>
                  <Rating value={Number(rev.rating) || 5} readOnly size="small" />
                  {rev.title && (
                    <Typography variant="subtitle2" fontWeight={700}>
                      {rev.title}
                    </Typography>
                  )}
                </Box>

                <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                  {rev.comment}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      ) : (
        !isLoading && (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No reviews available yet for this item.
            </Typography>
          </Box>
        )
      )}

      {/* Write a Review Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Share Your Product Experience</DialogTitle>
        <DialogContent dividers>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Overall Rating *
            </Typography>
            <Rating
              value={rating}
              onChange={(e, val) => setRating(val || 5)}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            label="Your Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. John D."
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Headline / Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's most important to know?"
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            required
            label="Write your review *"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? How does it perform day to day?"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerReviews;
