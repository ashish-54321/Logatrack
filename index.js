const express = require('express');
const os = require('os');
const fs = require('fs');
const moment = require('moment-timezone');
const cors = require('cors');
const useragent = require('express-useragent');
const axios = require('axios');
const requestIp = require('request-ip');

const app = express();
const port = 5000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse user agent
app.use(useragent.express());

// Middleware to get the client's IP address
app.use(requestIp.mw());

app.get("/", (req, res) => {
  res.send("Hello It's Working...");
});

// Your API endpoint
app.get("/api/logtracker", async (req, res) => {
  try {
    const timestamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
    const ipAddress = req.clientIp;

    // Get location and time information based on IP
    const ipInfoResponse = await axios.get(`https://ipinfo.io/${ipAddress}?token=20d83ed5703c7a`);
    const ipInfoData = ipInfoResponse.data;

    const { country, region, city, timezone } = ipInfoData;

    const systemInfo = `${os.platform()} ${os.release()}`;
    const browser = req.useragent.browser || 'Unknown Browser';

    // Extract device model name from user agent
    const deviceModel = req.useragent.source.match(/\(([^)]+)\)/) || [];
    const deviceName = req.useragent.device || 'Unknown Device';
    const model = deviceModel[1] || 'Unknown Model';

    // Check for undefined values and provide default values if necessary
    const logDetails = `
      Time: ${timestamp}
      User: ${req.user || 'Guest'}
      IP: ${ipAddress}
      System: ${systemInfo}
      Browser: ${browser}
      Device: ${deviceName}
      Model: ${model}
      Country: ${country || 'N/A'}
      Region: ${region || 'N/A'}
      City: ${city || 'N/A'}
      Timezone: ${timezone || 'N/A'}
      User-Agent: ${req.headers['user-agent']}
      ---------------------------------------------------
    `;

    // Log to console
    console.log(logDetails);

    // Log to file
    fs.appendFile('log.txt', logDetails, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  } catch (error) {
    console.error('Error fetching IP information:', error.message);
  }

  res.json({ message: "Log details recorded successfully!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});