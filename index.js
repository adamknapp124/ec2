require('dotenv').config();
const port = process.env.PORT || 3000;
const cors = require('cors');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());
app.use(cors());

// CLOUDINARY

const cloudinary = require('cloudinary').v2;
cloudinary.config({
	secure: true,
});

console.log(cloudinary.config());

app.post('/uploadToCloudinary', async (req, res) => {
	const { photo } = req.body;
	res.send('Image received');
	try {
		const result = await cloudinary.uploader.upload(photo);

		console.log(result);
	} catch (error) {
		console.log(error);
	}
});

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	password: process.env.DB_PASSWORD,
	user: process.env.DB_USER,
	database: process.env.DB_DATABASE,
});

app.get('/', (req, res) => {
	res.send('Request received');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
