const express = require('express');
const cors = require('cors');
require('dotenv').config();

const aiFeedbackRoutes = require('./routes/aiFeedback');
const courseManagementRoutes = require('./routes/courseManagement');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', aiFeedbackRoutes);
app.use('/api', courseManagementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor Express em execução na porta ${PORT}`);
});