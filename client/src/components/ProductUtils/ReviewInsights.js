import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Skeleton,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import {
  useGetReviewAnalysisQuery,
  useRefreshReviewAnalysisMutation,
} from "../../redux/apiSlice";

const ReviewInsights = ({ productId }) => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetReviewAnalysisQuery(productId, { skip: !productId });

  const [refreshAnalysis, { isLoading: isRefreshing }] =
    useRefreshReviewAnalysisMutation();

  const handleRefresh = async () => {
    if (!productId) return;
    try {
      await refreshAnalysis(productId).unwrap();
    } catch (err) {
      console.error("Failed to refresh review analysis:", err);
    }
  };

  const analysis = data?.analysis;

  /* ── 1. Loading Skeleton ── */
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#fcfcfd",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="text" width={220} height={32} />
        </Box>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1.5, mb: 2.5 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1.5 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1.5 }} />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  /* ── 2. Error State ── */
  if (isError) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "error.light",
          bgcolor: "#fffbfb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" color="error.main" fontWeight={600}>
            Could not load AI Review Insights
          </Typography>
          <Button size="small" variant="outlined" color="error" onClick={() => refetch()}>
            Retry
          </Button>
        </Box>
      </Paper>
    );
  }

  /* ── 3. Empty State (No Reviews Yet) ── */
  if (!analysis || analysis.analyzedReviewCount === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "#fbfcfd",
          textAlign: "center",
        }}
      >
        <ForumOutlinedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No Customer Reviews Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: "auto", mb: 2 }}>
          Be the first customer to share your thoughts! Once reviews are submitted, AI will automatically summarize consensus and key highlights.
        </Typography>
      </Paper>
    );
  }

  /* ── 4. Sentiment Badge Configuration ── */
  const sentiment = (analysis.overallSentiment || "neutral").toLowerCase();
  let sentimentEmoji = "😊";
  let sentimentLabel = "Positive";
  let sentimentColor = "success";

  if (sentiment === "negative") {
    sentimentEmoji = "🙁";
    sentimentLabel = "Critical";
    sentimentColor = "error";
  } else if (sentiment === "neutral") {
    sentimentEmoji = "😐";
    sentimentLabel = "Neutral";
    sentimentColor = "info";
  } else if (sentiment === "mixed") {
    sentimentEmoji = "⚖️";
    sentimentLabel = "Mixed";
    sentimentColor = "warning";
  }

  const dist = analysis.sentimentDistribution || { positive: 0, neutral: 0, negative: 0 };
  const posPct = Number(dist.positive) || 0;
  const neuPct = Number(dist.neutral) || 0;
  const negPct = Number(dist.negative) || 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#ffffff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: 26 }} />
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: "-0.01em" }}>
            Customer Review Insights
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            label={`Overall: ${sentimentEmoji} ${sentimentLabel}`}
            color={sentimentColor}
            size="medium"
            sx={{ fontWeight: 700, fontSize: "0.85rem" }}
          />

          <Button
            size="small"
            variant="outlined"
            onClick={handleRefresh}
            disabled={isRefreshing || isFetching}
            startIcon={
              isRefreshing || isFetching ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <RefreshIcon fontSize="small" />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
          >
            {isRefreshing || isFetching ? "Analyzing..." : "Refresh Insights"}
          </Button>
        </Box>
      </Box>

      {/* AI Summary Box */}
      <Box
        sx={{
          mt: 2.5,
          mb: 3,
          p: 2.2,
          bgcolor: "rgba(25, 118, 210, 0.04)",
          borderRadius: 1.5,
          borderLeft: "4px solid",
          borderColor: "primary.main",
        }}
      >
        <Typography variant="subtitle2" color="primary.main" fontWeight={700} gutterBottom>
          AI SYNTHESIS ({analysis.analyzedReviewCount} {analysis.analyzedReviewCount === 1 ? 'Review' : 'Reviews'} Analyzed)
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.65, fontSize: "0.92rem" }}>
          {analysis.summary}
        </Typography>
      </Box>

      {/* Sentiment Breakdown */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Sentiment Breakdown
        </Typography>
        <Grid container spacing={2}>
          {/* Positive Bar */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} color="success.main">
                Positive
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {posPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={posPct}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#e8f5e9",
                "& .MuiLinearProgress-bar": { bgcolor: "#2e7d32", borderRadius: 4 },
              }}
            />
          </Grid>

          {/* Neutral Bar */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Neutral
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {neuPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={neuPct}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#f5f5f5",
                "& .MuiLinearProgress-bar": { bgcolor: "#757575", borderRadius: 4 },
              }}
            />
          </Grid>

          {/* Negative Bar */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} color="error.main">
                Critical / Negative
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {negPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={negPct}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#ffebee",
                "& .MuiLinearProgress-bar": { bgcolor: "#d32f2f", borderRadius: 4 },
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Highlights & Concerns Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* What Customers Like */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2,
              height: "100%",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "#e0f2f1",
              bgcolor: "#f9fbfb",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
              <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                What Customers Like 👍
              </Typography>
            </Box>
            {analysis.positiveHighlights && analysis.positiveHighlights.length > 0 ? (
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {analysis.positiveHighlights.map((highlight, index) => (
                  <Typography
                    component="li"
                    variant="body2"
                    key={index}
                    sx={{ mb: 0.75, color: "text.secondary", fontSize: "0.86rem" }}
                  >
                    {highlight}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No specific positive highlights identified yet.
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Common Complaints */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2,
              height: "100%",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "#fbe9e7",
              bgcolor: "#fffbfb",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
              <ReportProblemOutlinedIcon sx={{ color: "error.main", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Common Complaints 👎
              </Typography>
            </Box>
            {analysis.negativeHighlights && analysis.negativeHighlights.length > 0 ? (
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {analysis.negativeHighlights.map((complaint, index) => (
                  <Typography
                    component="li"
                    variant="body2"
                    key={index}
                    sx={{ mb: 0.75, color: "text.secondary", fontSize: "0.86rem" }}
                  >
                    {complaint}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No major complaints or critical issues reported by customers.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Actionable Insights */}
      {analysis.actionableInsights && analysis.actionableInsights.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "warning.light",
            bgcolor: "#fffdfa",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
            <LightbulbOutlinedIcon sx={{ color: "warning.main", fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
              Actionable Customer Feedback 💡
            </Typography>
          </Box>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {analysis.actionableInsights.map((insight, index) => (
              <Typography
                component="li"
                variant="body2"
                key={index}
                sx={{ mb: 0.5, color: "text.secondary", fontSize: "0.86rem" }}
              >
                {insight}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* Common Topics Tags */}
      {analysis.commonTopics && analysis.commonTopics.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 2 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Frequent Topics:
          </Typography>
          {analysis.commonTopics.map((topic, index) => (
            <Chip
              key={index}
              label={topic}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.75rem", borderRadius: 1 }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default ReviewInsights;
