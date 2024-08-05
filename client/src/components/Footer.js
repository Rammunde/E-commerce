import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <div className="footer" style={footerStyle}>
      {/* <div style={logoSectionStyle}>
        <img
          src="https://img.etimg.com/thumb/msid-100973430,width-650,height-488,imgsize-2985114,resizemode-75/indian-ecommerce-market.jpg" // Replace with your company logo URL
          alt="Company Logo"
          style={logoStyle}
        />
        <h1 style={companyNameStyle}>E-com Dashboard</h1>
      </div> */}
      <div style={infoSectionStyle}>
        <p><strong>Address:</strong> 1234 Beed, Parali, sirsala, India</p>
        <p><strong>Email:</strong> rammunde9834@gmail.com</p>
        <p><strong>Contact Number:</strong> 9834631497</p>
      </div>
      <div style={socialMediaStyle}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
          <FontAwesomeIcon icon={faFacebookF} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
          <FontAwesomeIcon icon={faInstagram} />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
          <FontAwesomeIcon icon={faLinkedin} />
        </a>
      </div>
    </div>
  );
};

// Styles for the footer
const footerStyle = {
  backgroundColor: "#504C4C",
  padding: "10px",
  textAlign: "center",
  position: "relative",
  width: "100%",
  bottom: "0",
  color: "white",
};

const logoSectionStyle = {
  marginBottom: "10px",
};

const logoStyle = {
  height: "50px",
  verticalAlign: "middle",
};

const companyNameStyle = {
  margin: "0",
  fontSize: "24px",
  fontWeight: "bold",
};

const infoSectionStyle = {
  marginBottom: "10px",
};

const socialMediaStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};

const iconStyle = {
  fontSize: "20px",
  color: "#333",
  textDecoration: "none",
};

export default Footer;
