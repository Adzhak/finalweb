const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const collection = require('./config.js');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const app = express();
const localizationMiddleware = require('../middleware/localizationMiddleware');
const adminRoutes = require('./adminRoutes.js');
const multer = require('multer');
const Item = require('../models/Item');
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));



app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));


app.use(localizationMiddleware);
app.set('view engine', 'ejs');
app.use(express.static("public"))
app.get('/', isAuthenticated, async (req, res) => {
    try {
        // Fetch items from the database
        const items = await Item.find();

        // Define the language based on some condition, or use a default value
        const lang = 'en'; // Change this to your desired logic for determining the language

        // Assuming you have the user object available in your request (req) object
        const user = req.user; // Adjust this according to how you store user information

        // Render the home template and pass the items, lang, and user variables
        res.render("home", { items, lang, user:req.session.user });
    } catch (err) {
        console.error('Error retrieving items:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/office", (req, res) => {
    res.render("office", { user: req.session.user }); // Pass the user object to the home view
});


app.get("/signup",(req,res) =>{
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password,
            isAdmin: false, // Set isAdmin to false by default
            balance:1000
        };

        const existingUser = await collection.findOne({ name: data.name });

        if (existingUser) {
            res.send("User already exists. Please try another username");
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;
            const userData = await collection.insertMany(data);
            res.render("login");
        }
    } catch (error) {
        console.error("Error during signup:", error);
        res.send("An error occurred during signup");
    }
});
app.get("/login",(req,res) =>{
    res.render("login");
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user in the database
        const user = await collection.findOne({ name: username });

        // If user doesn't exist, return an error
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).send('Incorrect password');
        }

        // Set user information in the session
        req.session.user = user;

        // Redirect to the home page after successful login
        res.redirect('/');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/explore-market", isAuthenticated, (req, res) => {
    // Render Explore Market page for all authenticated users
    res.render("explore-market");
});

// Assuming you have a route handler for the 'office' page
// Assuming you have a route handler for the 'office' page

// Office route





app.get('/admin-panel', async (req, res) => {
    const lang = 'en';
    try {
        // Fetch items from the database
        const items = await Item.find();
        res.render('admin-panel', { items,lang }); // Pass items to the EJS template
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/protected-route', isAuthenticated, (req, res) => {
    // This route is protected and only accessible to authenticated users
    res.send('Welcome to the protected route!');
  });

  app.get("/logout", (req, res) => {
    // Clear user session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.sendStatus(500);
        } else {
            res.redirect('/login'); // Redirect to login page after logout
        }
    });
});


app.post('/change-language', (req, res) => {
    const { lang } = req.body;
    // Set language cookie to the selected language
    res.cookie('lang', lang, { maxAge: 900000, httpOnly: true });
    // Redirect back to the previous page or any other desired page
    res.redirect('back');
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Upload files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Set filename to be unique
    }
});

const upload = multer({ storage: storage });
app.use('/admin', adminRoutes);
app.get('/explore-market', isAuthenticated, async (req, res) => {
    try {
        // Fetch items from the database
        const items = await Item.find();

        // Pass the user object to the explore-market view
        res.render('explore-market', { user: req.session.user, items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Implement the function to fetch market information
async function fetchMarketInfo() {
    // Replace this with actual code to fetch market information from your data source
    const marketInfo = {
        // Sample market data
        stocks: [
            { symbol: 'AAPL', price: 150.25 },
            { symbol: 'GOOGL', price: 2800.75 },
            // Add more stock data as needed
        ],
        // Add more market data as needed
    };

    return marketInfo;
}


const port = 3000;
app.listen(port, () => {
    console.log('Server running on port : 3000');
})