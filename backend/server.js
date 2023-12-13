import express from 'express'
import methodOverride from 'method-override'
import mongoose, { mongo } from 'mongoose'
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs'
import session from 'express-session'
import passport from 'passport';
import jwt from 'jsonwebtoken'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import 'dotenv/config'


const app = express();
const port = 3000

// Middleware
app.use(express.json())
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(methodOverride('_method'))

// Session setup
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
// Passport setup
app.use(passport.initialize())
app.use(passport.session())

//Passport local strategy
passport.use(new LocalStrategy(
    async (username, password, done) => {
        const user = await User.findOne({ username: username, });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            console.log('Incorrect password or username')
            return done(null, false, { message: 'Incorrect username or password.' })
        }
        console.log('logged in successfull')
        return done(null, user)
    }
))
// Passport serialization and deserialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err);
    });
});

// Function to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Invalid token
            return res.redirect('/login');
        }
        req.user = user;
        next();
    });
};

// Function to verify token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.sendStatus(401); // No Token, unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
};


// MongoDB 
const uri = 'mongodb://127.0.0.1:27017/FinalProject';
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('connected to MongoDB'))
    .catch((err) => console.log('COuld not connect to MongoDB', err))

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    username: String,
    password: String
})
const User = mongoose.model('Users', userSchema)

const fruitsSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    image: String
})
const Fruits = mongoose.model('Fruits', fruitsSchema)

//Routes

//home
app.get('/', (req, res) => {
    res.render('home', { title: 'Final Project', user: req.user })
})

//fruits
app.get('/fruits', ensureAuthenticated, async (req, res) => {
    try {
        const fruits = await Fruits.find();
        res.render('fruitViews/fruits', { fruits })
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching tasks from db')
    }
})
app.get('/fruits/add', verifyToken, (req, res) => {
    res.render('fruitViews/addFruit');
});
app.post('/fruits/add', async (req, res) => {
    const { fruitName, fruitPrice, fruitImage } = req.body;
    try {
        const maxIDFruit = await Fruits.findOne().sort({ id: -1 });
        const currentID = maxIDFruit ? maxIDFruit.id + 1 : 1; // Start from 1 if there are no existing fruits

        const fruit = new Fruits({
            id: currentID,
            name: fruitName,
            price: fruitPrice,
            image: fruitImage
        });

        const result = await fruit.save();
        const fruits = await Fruits.find();
        res.render('fruitViews/fruits', { fruits });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding fruit to db');
    }
});

app.post('/api/fruits/update/:id', async (req, res) => {
    const fruitId = req.params.id;
    const updatedName = req.body.updatedName;
    const updatedPrice = req.body.updatedPrice;
    const updatedImage = req.body.updatedImage;

    try {
        const result = await Fruits.updateOne(
            { id: fruitId }, // Filter criteria
            { $set: { name: updatedName, price: updatedPrice, image: updatedImage } },
        );

        if (result.matchedCount > 0) {
            res.redirect('/fruits')
        } else {
            res.status(404).json({ error: `Fruit with ID ${fruitId} not found` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Error updating fruit with ID ${fruitId}` });
    }
});
app.get('/api/fruits/update/:id', async (req, res) => {
    const fruitId = parseInt(req.params.id);
    try {
        const fruit = await Fruits.findOne({ id: fruitId });
        if (fruit) {
            res.render('fruitViews/updateFruit', { fruit });
        } else {
            res.status(404).send(`Fruit with ID ${fruitId} not found`);
        }
    } catch (err) {
        res.status(500).send(`Error fetching fruit ID`);
    }
});

app.delete('/api/fruits/delete/:id', async (req, res) => {
    const fruitId = parseInt(req.params.id);
    try {
        const result = await Fruits.deleteOne({ id: fruitId });
        if (result.deletedCount > 0) {
            
            res.redirect('/fruits')
        } else {
            res.status(404).json({ error: `Fruit with ID ${fruitId} not found` });
        }
    } catch (err) {
        console.error(`Error deleting fruit with ID ${fruitId}:`, err);
        res.status(500).json({ error: `Error deleting fruit with ID ${fruitId}` });
    }
});

// FRUITS API
//get all fruits
app.get('/api/fruits', async (req, res) => {
    try {
        const fruits = await Fruits.find();
        if (fruits.length > 0) {
            res.json({ data: { fruits } });
        } else {
            res.json({ message: 'No fruits found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching fruits from db');
    }
});
//get specific fruit by id
app.get('/api/fruits/:id', async (req, res) => {
    const fruitId = req.params.id;
    try {
        const fruit = await Fruits.findById(fruitId);
        if (fruit) {
            res.json({ data: { fruit } });
        } else {
            res.status(404).json({ error: `Fruit with ID ${fruitId} not found` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error fetching fruit with ID ${fruitId}`);
    }
});


// Identity Management

//login
app.get('/login', (req, res) => {
    res.render('authenticationViews/login')
})
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: 'Incorrect username or password.' });
        }
        req.login(user, (err) => {
            if (err) {
                console.error(err); // Log the error for debugging
                return next(err);
            }
            try {
                const token = jwt.sign({ id: user._id, user: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.cookie('token', token, { httpOnly: true });
                res.redirect('/');
            } catch (tokenError) {
                console.error(tokenError); // Log the error for debugging
                return next(tokenError);
            }
        });
    })(req, res, next);
});

//register
app.get('/register', (req, res) => {
    res.render('authenticationViews/register')
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        const newUser = new User({ username: req.body.username, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.log(error);
        res.redirect('/register');
    }
});

//logout
app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error(err); // Log the error for debugging
            return next(err);
        }
        res.cookie('token', process.env.JWT_SECRET, { expires: new Date(0), httpOnly: true });
        res.redirect('/');
    });
});


//server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
})