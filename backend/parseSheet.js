const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'khata-backend' }));
app.use('/api/reconcile', require('./routes/upload'));
app.use('/api/batches', require('./routes/batches'));
module.exports = app;
