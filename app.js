require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const createHttpError = require('http-errors');
const authRoutes = require('./router/authRoutes');
const bodyParser = require('body-parser');
const cookiesParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middware/authMiddware');
const session = require('express-session');
const connectFlash = require('connect-flash');
const app = express();

// Morgan
app.use(morgan('dev'));

/**
 * @define PORT Number
 * @define Database URL
 */
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookiesParser());

// Using Body-parser
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

// Set templating engine
app.set('view engine','ejs');
app.use(express.urlencoded({ extended : true }));

// Init Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true
  }
}));

// Show some messages in browser using flash package
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
})

// Database connection
mongoose.connect(DB_URL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(() => console.log('mongoDB is connected successfully!'))
.catch((err) => console.log(err.message));

// Routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/teams', requireAuth, (req, res) => res.render('teams'));
app.use(authRoutes);

//Page Not Found Errors
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {   
  error.status = error.status || 500
  res.status(error.status);
  res.render('error', { error });
})

// Listening port number || 3000
app.listen(PORT, () => {
  console.log(`Server is listen port ${PORT}`);
})