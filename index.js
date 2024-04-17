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

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	password: process.env.DB_PASSWORD,
	user: process.env.DB_USER,
	database: process.env.DB_DATABASE,
});

// CLOUDINARY

const cloudinary = require('cloudinary').v2;
cloudinary.config({
	secure: true,
});

console.log(cloudinary.config());

// Uploads image to cloudinary then sends the public_id to MySQL database
app.post('/uploadToCloudinary', async (req, res) => {
	const { photo } = req.body;
	// Uploads the base64 image to cloudinary
	try {
		const result = await cloudinary.uploader.upload(photo);
		const public_id = result.public_id;

		// Saves public_id to MySQL database
		const query = 'INSERT INTO photos (public_id) VALUES (?)';
		connection.query(query, public_id, (error) => {
			if (error) {
				console.error('Error saving public id to database:', error);
				res.status(500).json({ error: 'Failed to save public id to database' });
				return;
			}
			console.log('Public ID saved to database:', public_id);
			res.status(200).json({ public_id });
		});
	} catch (error) {
		console.log(error);
	}
});

app.get('/getPublicIds', (req, res) => {
	const query = 'SELECT * FROM photos';
	connection.query(query, (error, results) => {
		if (error) {
			console.error('Error fetching public ids from database: ', error);
			res.status(500).json({
				error: 'Failed to fetch public ids',
			});
		} else {
			const publicIds = results.map((result) => result.public_id);
			res.status(200).json({ publicIds });
		}
	});
});

app.get('/', (req, res) => {
	res.send('Request received');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
