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

const taskSchema = new mongoose.Schema({
    name: String,
    id: Number
})
const Tasks = mongoose.model('Tasks', taskSchema)


//Routes

//home
app.get('/', (req, res) => {
    res.render('home', { title: 'Final Project', user: req.user })
})

//tasks
app.get('/tasks', ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Tasks.find();
        res.render('tasksViews/tasks', { tasks })
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching tasks from db')
    }
})
app.get('/tasks/add', (req, res) => {
    res.render('tasksViews/addTask')
})
app.post('/tasks/add', async (req, res) => {
    const { taskName } = req.body;
    try {
        const maxIDTask = await Tasks.findOne().sort({ id: -1 });
        const currentID = maxIDTask ? maxIDTask.id + 1 : 0

        const task = new Tasks({
            name: taskName,
            id: currentID
        });

        const result = await task.save();
        console.log("Saved successfully", result);
        res.json({ data: { message: `Successfully added new task ${taskName}`, task: task } })
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding task to db");
    }
});
app.post('/api/tasks/update/:id', async (req, res) => {
    const taskID = parseInt(req.params.id);
    const updatedName = req.body.updatedName;
    try {
        const result = await Tasks.updateOne({ id: taskID }, { $set: { name: updatedName } });
        if (result.matchedCount > 0) {
            const updatedTask = await Tasks.findOne({ id: taskID });
            res.json({ data: { message: `Successfully updated task with ID ${taskID}`, task: updatedTask } })
        } else {
            res.status(404).json({ error: `Task with ID ${taskID} not found` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Error updating task with ID ${taskID}` });
    }
});
app.get('/api/tasks/update/:id', async (req, res) => {
    const taskID = parseInt(req.params.id);
    try {
        const task = await Tasks.findOne({ id: taskID });
        if (task) {
            res.render('tasksViews/updateTask', { task });
        } else {
            res.status(404).send(`Task with ID ${taskID} not found`);
        }
    } catch {
        res.status(500).send(`Error fetching task ID`);
    }
});
app.delete('/api/tasks/delete/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
        const result = await Tasks.deleteOne({ id: taskId });
        if (result.deletedCount > 0) {
            console.log();
            res.json({ data: { message: `Task with ID ${taskId} deleted successfully.` } })
        } else {
            console.log(`Task with ID ${taskId} not found.`);
            res.status(404).json({ error: `Task with ID ${taskId} not found` });
        }
    } catch (err) {
        console.error(`Error deleting task with ID ${taskId}:`, err);
        res.status(500).json({ error: `Error deleting task with ID ${taskId}` });
    }
});

// TASKS API
//get all tasks
app.get('/api/tasks', ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Tasks.find();
        if (tasks.length > 0) {
            res.json({ data: {tasks: tasks} })
        } else {
            res.json({ message: 'No tasks found' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching tasks from db')
    }
})
//get specific tasks by id
app.get('/api/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
        const task = await Tasks.findOne({ id: taskId })
        if (task) {
            res.json({ task: task })
        } else {
            res.status(404).json({ error: `Task with ID ${taskId} not found` });
        }
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching tasks from db')
    }
})


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