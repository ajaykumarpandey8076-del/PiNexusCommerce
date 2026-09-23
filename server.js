
const GEMINI_API_KEY = 'AIzaSyA.AQ.Ab8RN6L7kky3HB0VcPQat64LIaKMBItdLX2iik0tr3ocGZ1Y9A';
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
