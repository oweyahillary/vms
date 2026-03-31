require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes/visitor.routes');
const logger = require('./utils/logger');

const app = express();

app.use(cors({ origin: '*' }));
app.use(helmet());
app.use(express.json({ limit: '15mb' }));

// Request logger
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url });
  next();
});

// Routes
app.use('/api/visitors', routes);

// Health check — confirms server is running
app.get('/', (req, res) => res.json({ status: 'VMS Backend Running' }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error({ event: 'unhandled_error', error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

// Local dev only — Vercel uses the export below
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;
