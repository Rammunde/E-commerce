import React, { useState } from 'react';
import { Box, Grid, TextField, Button, Typography } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Alert from '@mui/material/Alert';
import { containerStyle,center } from './Utils';

const ContactUs = () => {
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState('');
  const [emailId, setEmailId] = useState('');
  const [message, setMessage] =useState('');
  const [respMsg, setRespMsg] = useState('');
  const [error, setError] = useState(false);


  const sendMailToOwner = () =>{
    fetch("http://localhost:5000/users/sendMailToOwner", {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ name, mobileNo, emailId, message }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setRespMsg(data?.msg);
        setError(data.err);
      });
  }
  const handleCloseRes =()=>{
    setRespMsg('');
    setError(false);
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
      {respMsg && (
            <Grid item xs={12}>
              {respMsg && !error && (
                <Alert
                  onClose={handleCloseRes}
                  severity="success"
                  sx={{ marginBottom: 2 }}
                >
                  {respMsg}
                </Alert>
              )}
              {respMsg && error && (
                <Alert
                  onClose={handleCloseRes}
                  severity="error"
                  sx={{ marginBottom: 2 }}
                >
                  {respMsg}
                </Alert>
              )}
            </Grid>
          )}
          <Typography variant="h4" gutterBottom>Contact Us</Typography>
          {/* <form> */}
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e)=> setName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={emailId}
              onChange={(e)=> setEmailId(e.target.value)}
            />
            <TextField
              fullWidth
              label="Phone"
              variant="outlined"
              margin="normal"
              value={mobileNo}
              onChange={(e)=> setMobileNo(e.target.value)}
            />
            <TextField
              fullWidth
              label="Message"
              variant="outlined"
              margin="normal"
              multiline
              value={message}
              onChange={(e)=>{setMessage(e.target.value)}}
              maxRows={3}
              minRows={3}
            //   rows={4}
            />
            <Button variant="contained" color="primary" type="submit" disabled={!emailId || !message} onClick={sendMailToOwner}>
              Submit
            </Button>
          {/* </form> */}
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
