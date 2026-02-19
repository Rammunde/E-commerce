const nodemailer = require("nodemailer");

// Email configuration
// For Gmail, use App Password (not regular password)
// Generate at: https://myaccount.google.com/apppasswords

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Generate HTML email template for order confirmation
 */
const generateOrderEmailHTML = (orderDetails) => {
  const { userName, orderItems, priceDetails, orderId } = orderDetails;

  const itemsHTML = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
          <br><span style="color: #666; font-size: 12px;">${item.company || ""}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.finalPrice || item.price}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #1976d2; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #1976d2; padding-top: 12px; margin-top: 12px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .success-badge { background: #4caf50; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🛒 Shopveda</h1>
          <h2 style="margin: 10px 0 0 0; font-weight: normal;">Order Confirmation</h2>
          <div class="success-badge">✓ Order Placed Successfully</div>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Thank you for your order! Here are your order details:</p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Order ID:</strong> #${orderId}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
          </p>
          
          <table class="order-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="summary">
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Subtotal (${priceDetails.totalItems} items)</td>
                <td style="text-align: right; font-weight: bold; padding: 8px 0; border-bottom: 1px solid #eee;">₹${priceDetails.originalTotal}</td>
              </tr>
              <tr style="color: #4caf50;">
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Discount</td>
                <td style="text-align: right; font-weight: bold; padding: 8px 0; border-bottom: 1px solid #eee;">- ₹${priceDetails.discountTotal}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Platform Fee</td>
                <td style="text-align: right; font-weight: bold; padding: 8px 0; border-bottom: 1px solid #eee;">₹${priceDetails.platformFee}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Delivery</td>
                <td style="text-align: right; font-weight: bold; color: #4caf50; padding: 8px 0; border-bottom: 1px solid #eee;">Free</td>
              </tr>
              <tr style="font-size: 18px; font-weight: bold;">
                <td style="padding-top: 12px; border-top: 2px solid #1976d2;">Total Amount</td>
                <td style="text-align: right; padding-top: 12px; border-top: 2px solid #1976d2;">₹${priceDetails.finalTotal}</td>
              </tr>
            </table>
          </div>
          
          <p style="margin-top: 30px; color: #666;">
            We'll notify you when your order ships. If you have any questions, please contact our support team.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Shopveda. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send order confirmation email
 * @param {string} toEmail - Recipient email address
 * @param {object} orderDetails - Order details including items and pricing
 * @returns {Promise} - Resolves with email info or rejects with error
 */
const sendOrderConfirmation = async (toEmail, orderDetails) => {
  const mailOptions = {
    from: `"Shopveda" <${EMAIL_USER}>`,
    to: toEmail,
    subject: `Order Confirmed! #${orderDetails.orderId} - Shopveda`,
    html: generateOrderEmailHTML(orderDetails),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
};
