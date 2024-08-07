import React from 'react';
import { Box, Grid, TextField, Button, Typography } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { containerStyle,center } from './Utils';

const ContactUs = () => {

  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>Contact Us</Typography>
          <form>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Message"
              variant="outlined"
              margin="normal"
              multiline
              maxRows={3}
              minRows={3}
            //   rows={4}
            />
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </form>
        </Grid>
        <Grid item xs={12} md={6}>
          <LoadScript
            // googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          >
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={14}
            >
              <Marker position={center} />
            </GoogleMap>
          </LoadScript>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactUs;
