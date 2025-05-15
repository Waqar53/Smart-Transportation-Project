const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect('mongodb://127.0.0.1:27017/smart-traffic')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));
const TrafficSchema = new mongoose.Schema({
    lat: Number,
    lng: Number,
    trafficLevel: String
});

const Traffic = mongoose.model('Traffic', TrafficSchema);

// API to fetch traffic data
app.get('/traffic-data', async (req, res) => {
    const trafficData = await Traffic.find();
    res.json(trafficData);
});

// API to update traffic data
app.post('/update-traffic', async (req, res) => {
    const { lat, lng, trafficLevel } = req.body;
    await Traffic.create({ lat, lng, trafficLevel });
    res.json({ message: "Traffic data updated" });
});

app.listen(5000, () => console.log("Server running on port 5000"));