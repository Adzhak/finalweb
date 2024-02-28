const express = require('express');
const axios = require('axios');
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

const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // Ensure body-parser is used for form data
// Connect to MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
  const { MongoClient } = require('mongodb');
  
  // This function gets the current BTC rate from some API
  async function getCurrentBtcRate() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const btcRate = data.bitcoin.usd; // Replace 'rate' with actual path to rate in API response
      return btcRate;
    } catch (error) {
      console.error('Error fetching BTC rate:', error);
      throw error;
    }
  }
  
  // This function updates the user's balance in the database
  async function updateUserBalance(name, usdAmount, btcAmount, convertTo) {
    const client = await MongoClient.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const users = client.db("YourDatabaseName").collection("users"); // replace YourDatabaseName with your actual database name
    const user = await users.findOne({ name: name });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    let updatedUsdBalance, updatedBtcBalance;
  
    if (convertTo === 'BTC') {
      if (user.balance < usdAmount) {
        throw new Error('Not enough USD balance');
      }
      updatedUsdBalance = user.balance - usdAmount;
      updatedBtcBalance = user.btc + btcAmount;
    } else {
      if (user.btc < btcAmount) {
        throw new Error('Not enough BTC balance');
      }
      updatedUsdBalance = user.balance + usdAmount;
      updatedBtcBalance = user.btc - btcAmount;
    }
  
    await users.updateOne(
      { name: name },
      {
        $set: {
          balance: updatedUsdBalance,
          btc: updatedBtcBalance,
        },
      }
    );
  
    await client.close();
  
    return { updatedUsdBalance, updatedBtcBalance };
  }
  
  // The route that handles the conversion
  app.post('/convert-currency', async (req, res) => {
    const { userName, amount, convertTo } = req.body;
  
    try {
      // Assuming the amount is always given in the currency being converted from
      const currentBtcRate = await getCurrentBtcRate();
      let usdAmount, btcAmount;
  
      if (convertTo === 'BTC') {
        // Convert USD to BTC
        usdAmount = parseFloat(amount);
        btcAmount = usdAmount / currentBtcRate;
      } else {
        // Convert BTC to USD
        btcAmount = parseFloat(amount);
        usdAmount = btcAmount * currentBtcRate;
      }
  
      // Update the user's balance in the database
      const { updatedUsdBalance, updatedBtcBalance } = await updateUserBalance(userName, usdAmount, btcAmount, convertTo);
  
      res.json({
        message: 'Currency converted successfully',
        usdBalance: updatedUsdBalance,
        btcBalance: updatedBtcBalance,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
const historySchema = new mongoose.Schema({
  timestamp: Date,
  data: Object,
});
const History = mongoose.model('History', historySchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// Explore Market Endpoint
app.get('/explore-market', async (req, res) => {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
        const marketData = response.data["Time Series (Daily)"];
        res.render('explore-market', { marketData: marketData });
    } catch (error) {
        console.error('Error fetching market data:', error);
        res.status(500).send('Error fetching market data');
    }
});

// Save Data Endpoint
app.post('/save-data', async (req, res) => {
    const { timestamp, data } = req.body;

    const newHistoryEntry = new History({
        timestamp: new Date(timestamp),
        data: JSON.parse(data)
    });

    try {
        await newHistoryEntry.save();
        res.redirect('/history');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data');
    }
});

// History Endpoint
app.get('/history', async (req, res) => {
    try {
        const historyData = await History.find({});
        res.render('history', { historyData });
    } catch (error) {
        console.error('Error retrieving history:', error);
        res.status(500).send('Error retrieving history');
    }
});

app.get('/get-btc-rate', async (req, res) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.bitcoin && data.bitcoin.usd) {
        res.json({ rate: data.bitcoin.usd });
      } else {
        throw new Error('Malformed API response');
      }
    } catch (error) {
      console.error('Error fetching BTC rate:', error.message);
      res.status(500).json({ error: 'Error fetching BTC rate' });
    }
  });
app.post('/convert-currency', async (req, res) => {
    const userId = req.user.name; // Assuming the user's ID is stored in the session
    const { amount, convertTo } = req.body; // Amount to convert and direction of conversion
  
    try {
      // Get the current BTC rate
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      const btcRate = data.bitcoin.usd;
  
      // Retrieve the user's current balances
      const { balance, btc } = await getUserBalance(userId);
  
      let newUsdBalance, newBtcBalance;
  
      // Perform the conversion
      if (convertTo === 'BTC') {
        // Ensure the user has enough USD to convert
        if (balance < amount) {
          return res.status(400).json({ error: 'Insufficient USD balance.' });
        }
        newUsdBalance = balance - amount;
        newBtcBalance = btc + (amount / btcRate);
      } else {
        // Ensure the user has enough BTC to convert
        const btcAmount = amount / btcRate;
        if (btc < btcAmount) {
          return res.status(400).json({ error: 'Insufficient BTC balance.' });
        }
        newUsdBalance = balance + (btcAmount * btcRate);
        newBtcBalance = btc - btcAmount;
      }
      const userId = req.user._id; // Get the user's ID from the session or decoded JWT
const convertedUsdAmount = newUsdBalance; // The result of the currency conversion from USD to BTC
const convertedBtcAmount = newBtcBalance; // The result of the currency conversion from BTC to USD

// Call the updateUserBalance function with the new balances
await updateUserBalance(userId, convertedUsdAmount, convertedBtcAmount);
res.json({
    message: 'Balance updated successfully',
    newUsdBalance: convertedUsdAmount,
    newBtcBalance: convertedBtcAmount
  });
    } catch (error) {
      console.error('Error during currency conversion:', error);
      res.status(500).json({ error: 'Error during currency conversion' });
    }
  });
  
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
        res.render("home", { items, lang, user:req.session.user,req });
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

// Set up static files directory
app.use(express.static('public'));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Route to render the Explore Market page
const port = 3000;
app.listen(port, () => {
    console.log('Server running on port : 3000');
})