const express = require('express');
const os = require('os');
// const fs = require('fs');
const moment = require('moment-timezone');
const cors = require('cors');
const useragent = require('express-useragent');
const axios = require('axios');
const requestIp = require('request-ip');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse user agent
app.use(useragent.express());

// Middleware to get the client's IP address
app.use(requestIp.mw());

app.get("/", (req, res) => {
    res.send("Api's Now Live By Ashish Tiwari");
});



// Function to create a delay for a specified number of minutes
function delay(minutes) {
    return new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
}

// Make Free Server Allways Active
async function keepAlive() {
    const speek = await axios.get(`https://logatrack.onrender.com`)
    await delay(14);
    keepAlive();
}

// Your API endpoint
app.post("/api/logtracker", async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const timestamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
        const ipAddress = req.clientIp;

        // Get location and time information based on IP
        const ipInfoResponse = await axios.get(`https://ipinfo.io/${ipAddress}?token=20d83ed5703c7a`);
        const ipInfoData = ipInfoResponse.data;

        const { country, region, city, timezone } = ipInfoData;

        const systemInfo = `${os.platform()} ${os.release()}`;
        const browser = req.useragent.browser || 'Unknown Browser';

        const deviceModel = req.useragent.source.match(/\(([^)]+)\)/) || [];
        const deviceName = req.useragent.device || 'Unknown Device';
        const model = deviceModel[1] || 'Unknown Model';

        const logDetails = `
      Time: ${timestamp}
      User: ${req.user || 'Guest'}
      IP: ${ipAddress}
      System: ${systemInfo}
      Browser: ${browser}
      Device: ${deviceName}
      Model: ${model}
      Latitude: ${latitude || 'N/A'}
      Longitude: ${longitude || 'N/A'}
      Country: ${country || 'N/A'}
      Region: ${region || 'N/A'}
      City: ${city || 'N/A'}
      Timezone: ${timezone || 'N/A'}
      User-Agent: ${req.headers['user-agent']}
      ---------------------------------------------------
    `;

        console.log(logDetails);

        const data = {
            date: timestamp,
            time: timestamp,
            user: req.user || 'Guest',
            ip: ipAddress,
            system: systemInfo,
            browser: browser,
            device: deviceName,
            model: model,
            latitude: latitude || 'N/A',
            longitude: longitude || 'N/A',
            country: country || 'N/A',
            region: region || 'N/A',
            city: city || 'N/A',
            timezone: timezone || 'N/A',
            userAgent: req.headers['user-agent'],
        };

        // Save Data In Spreed Sheet 
        try {
            const response = await fetch("https://spreedsheet-63ux.onrender.com/spreedsheet/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const message = await response.text();
                console.log(message); // "Successfully submitted! Thank you!"

            } else {
                console.error("Failed to submit data:", response.statusText);

            }
        } catch (error) {
            console.error("Error:", error);

        }


        // fs.appendFile('log.txt', logDetails, (err) => {
        //     if (err) {
        //         console.error('Error writing to log file:', err);
        //     }
        // });

        // res.json({ message: "Log recorded successfully" });
    } catch (error) {
        console.error('Error fetching IP information:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
});

keepAlive();
