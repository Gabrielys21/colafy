
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');

const app = express();
app.use(cors());

const clientId = '';
const clientSecret = '';
const redirectUri = 'http://localhost:3000/callback';

app.get('/login', (req, res) => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=user-top-read user-read-playback-state user-modify-playback-state`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const tokenUrl = 'https://accounts.spotify.com/api/token';

    try {
        const response = await axios.post(tokenUrl, querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token } = response.data;
        res.redirect(`http://localhost:5500/index.html?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error('Error fetching access token:', error);
        res.send('Error fetching access token');
    }
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));