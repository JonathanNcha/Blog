const express = require('express');
const mongoose = require('mongoose');
const Article = require('./models/article');
const article = require('./models/article');
const User = require('./models/user');
const user = require('./models/user');
const comment = require('./models/comment');
const Comment = require('./models/comment')
const session = require('express-session');
const exphbs = require('express-handlebars');
const passport = require('passport');
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const articleRouter = require('./routes/articles');
const userRouter = require('./routes/articles');
const commentRouter = require('./routes/articles');
const methodOverride = require('method-override');
const app = express();

const dotenv = require('dotenv').config();
console.log(`Your port is ${process.env.PORT}`);

const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.r1dqxng.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url).then(() => console.log('connected to MongoDB'))
    .catch(e => console.log(e));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(session({
    secret: `process.env.SECRET`,
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'))
app.use(express.static(__dirname));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new localStrategy(function (username, password, done) {
    User.findOne({ username: username }, async function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });


        if (await bcrypt.compare(password, user.password)) {
            return done(null, user)
        } else {
            return done(null, false, { message: 'Password incorrect' })
        }
    });
}));

app.post('/login', passport.authenticate('local', {
    successRedirect: '/articles/index',
    failureRedirect: '/'
}));

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('articles/main', { articles: articles })
})

app.get('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect('/');
    });
});

app.use('/articles', articleRouter);
app.use('/register', userRouter);
app.use('/comments', commentRouter);
app.listen(process.env.PORT);