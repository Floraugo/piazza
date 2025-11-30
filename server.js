require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

app.use(cors());
app.use(bodyParser.json());

connectDB(process.env.MONGO_URI);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => res.send('Piazza API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
