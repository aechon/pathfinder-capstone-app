const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// import api routes
const routes = require('./routes');

// check if production enviroment
const { environment } = require('./config');
const isProduction = environment === 'production';

// initialize express app
const app = express();

// connect morgan middleware for logging
app.use(morgan('dev'));

// add parser middleware
app.use(cookieParser());
app.use(express.json());

// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}
  
// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);
  
// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);
// Security Middleware end

app.use(routes); // Connect all routes




module.exports = app;