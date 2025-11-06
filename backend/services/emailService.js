const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Send booking confirmation to counselor
const sendBookingConfirmation = async (counselorEmail, counselorName, clientName, appointmentDate, appointmentTime) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@counselhub.com',
    to: counselorEmail,
    subject: '📅 New Appointment Booking on CounselHub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="margin: 0;">💚 New Appointment Booking</h2>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hello <strong>${counselorName}</strong>,</p>
          
          <p>You have received a new appointment booking from a client!</p>
          
          <div style="background-color: #f0f4ff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px;">
            <p><strong>Client Name:</strong> ${clientName}</p>
            <p><strong>Appointment Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
            <p><strong>Appointment Time:</strong> ${appointmentTime}</p>
          </div>
          
          <p>Please <strong>accept or reject</strong> this appointment in your CounselHub dashboard.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation sent to ${counselorEmail}`);
  } catch (err) {
    console.error('Error sending booking confirmation:', err);
  }
};

// Send appointment confirmation to client
const sendAppointmentConfirmed = async (clientEmail, clientName, counselorName, appointmentDate, appointmentTime) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@counselhub.com',
    to: clientEmail,
    subject: '✓ Your Appointment is Confirmed on CounselHub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #00c853 0%, #00b84d 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="margin: 0;">✓ Appointment Confirmed</h2>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hello <strong>${clientName}</strong>,</p>
          
          <p>Great news! Your appointment has been <strong>confirmed</strong>!</p>
          
          <div style="background-color: #f0fff4; padding: 20px; border-left: 4px solid #00c853; margin: 20px 0; border-radius: 5px;">
            <p><strong>Counselor:</strong> ${counselorName}</p>
            <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
          </div>
          
          <p>You can now join the video call or chat with your counselor from your dashboard.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #00c853 0%, #00b84d 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment confirmation sent to ${clientEmail}`);
  } catch (err) {
    console.error('Error sending appointment confirmation:', err);
  }
};

// Send appointment rejection to client
const sendAppointmentRejected = async (clientEmail, clientName, counselorName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@counselhub.com',
    to: clientEmail,
    subject: '⚠️ Your Appointment Request was Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="margin: 0;">Appointment Rejected</h2>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hello <strong>${clientName}</strong>,</p>
          
          <p>Unfortunately, <strong>${counselorName}</strong> has rejected your appointment request.</p>
          
          <p>You can try booking with another counselor or request a different time slot.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/browse-counselors" style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Browse Other Counselors</a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection notification sent to ${clientEmail}`);
  } catch (err) {
    console.error('Error sending rejection notification:', err);
  }
};

// Send appointment reminder
const sendAppointmentReminder = async (email, name, counselorName, appointmentDate, appointmentTime) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@counselhub.com',
    to: email,
    subject: '⏰ Reminder: Your Appointment is Tomorrow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="margin: 0;">⏰ Appointment Reminder</h2>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hello <strong>${name}</strong>,</p>
          
          <p>This is a reminder that your appointment is <strong>tomorrow</strong>!</p>
          
          <div style="background-color: #fff8f0; padding: 20px; border-left: 4px solid #ffa500; margin: 20px 0; border-radius: 5px;">
            <p><strong>Counselor:</strong> ${counselorName}</p>
            <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
          </div>
          
          <p>Make sure you're ready a few minutes before the appointment time.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Now</a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder sent to ${email}`);
  } catch (err) {
    console.error('Error sending reminder:', err);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendAppointmentConfirmed,
  sendAppointmentRejected,
  sendAppointmentReminder
};
