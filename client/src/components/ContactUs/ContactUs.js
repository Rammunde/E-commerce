import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Stack,
  IconButton,
} from "@mui/material";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import SendIcon from "@mui/icons-material/Send";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { containerStyle, center } from "./Utils";

const API_BASE_URL = "http://localhost:5000";

const ContactInfoItem = ({ icon, title, content }) => (
  <Box display="flex" alignItems="flex-start" mb={3}>
    <Box
      sx={{
        mr: 2,
        p: 1.5,
        bgcolor: "primary.light",
        borderRadius: "50%",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
    </Box>
  </Box>
);

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    emailId: "",
    mobileNo: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.emailId) {
      tempErrors.emailId = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      tempErrors.emailId = "Email is invalid";
    }
    if (!formData.mobileNo) {
      tempErrors.mobileNo = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNo)) {
      tempErrors.mobileNo = "Phone number must be 10 digits";
    }
    if (!formData.message) tempErrors.message = "Message is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/sendMailToOwner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!data.err) {
        setSnackbar({
          open: true,
          message: data.msg || "Message sent successfully!",
          severity: "success",
        });
        setFormData({ name: "", emailId: "", mobileNo: "", message: "" });
      } else {
        throw new Error(data.msg || "Failed to send message");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Something went wrong",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  return (
    <Box
      sx={{
        py: 8,
        bgcolor: "#f8f9fa",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Grid container spacing={0} sx={{ boxShadow: 6, borderRadius: 4, overflow: "hidden", bgcolor: "white" }}>

          {/* Left Side: Contact Info & Map */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Background decoration circle */}
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -80,
                left: -80,
                width: 300,
                height: 300,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.1)",
              }}
            />

            <Box position="relative" zIndex={1}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Let's get in touch
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                We're open for any suggestion or just to have a chat.
              </Typography>

              <ContactInfoItem
                icon={<LocationOnIcon sx={{ color: "primary.main" }} />}
                title="Address"
                content="123 E-Commerce St, Tech City, IN 411001"
              />
              <ContactInfoItem
                icon={<PhoneIcon sx={{ color: "primary.main" }} />}
                title="Phone"
                content="+91 9172 123 412"
              />
              <ContactInfoItem
                icon={<EmailIcon sx={{ color: "primary.main" }} />}
                title="Email"
                content="support@ecommerce.com"
              />
            </Box>

            <Box position="relative" zIndex={1} mt={4}>
              <Typography variant="h6" gutterBottom>Connect with us</Typography>
              <Stack direction="row" spacing={2}>
                <IconButton sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)", '&:hover': { bgcolor: "white", color: "primary.main" } }}><FacebookIcon /></IconButton>
                <IconButton sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)", '&:hover': { bgcolor: "white", color: "primary.main" } }}><TwitterIcon /></IconButton>
                <IconButton sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)", '&:hover': { bgcolor: "white", color: "primary.main" } }}><LinkedInIcon /></IconButton>
                <IconButton sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)", '&:hover': { bgcolor: "white", color: "primary.main" } }}><InstagramIcon /></IconButton>
              </Stack>
            </Box>
          </Grid>

          {/* Right Side: Form & Map Preview */}
          <Grid item xs={12} md={7}>
            <Box sx={{ p: { xs: 3, md: 6 } }}>
              <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
                Send us a message
              </Typography>

              <form onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      variant="standard"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="emailId"
                      variant="standard"
                      value={formData.emailId}
                      onChange={handleChange}
                      error={!!errors.emailId}
                      helperText={errors.emailId}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="mobileNo"
                      variant="standard"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      error={!!errors.mobileNo}
                      helperText={errors.mobileNo}
                      disabled={loading}
                      inputProps={{ maxLength: 10 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={3}
                      variant="standard"
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      disabled={loading}
                      placeholder="Write your message here..."
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} mt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      endIcon={!loading && <SendIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 5,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: "bold",
                        boxShadow: 4
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {/* Styled Map Container */}
              <Box mt={6}>
                <Typography variant="subtitle2" color="text.secondary" mb={2}>
                  Visit our office
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    height: 250,
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    position: 'relative'
                  }}
                >
                  {googleMapsApiKey ? (
                    <LoadScript googleMapsApiKey={googleMapsApiKey}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={center}
                        zoom={14}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: true,
                        }}
                      >
                        <Marker position={center} />
                      </GoogleMap>
                    </LoadScript>
                  ) : (
                    <Box sx={{ width: "100%", height: "100%" }}>
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.1895186401614!2d73.85456251481498!3d18.52043028741031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c06fd714cc0b%3A0x6a2dbbb4570072d7!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1626081440000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        title="Google Map"
                      />
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactUs;
