const express = require('express');
const mongoose = require('mongoose');
const Article = require('./models/article');
const article = require('./models/article');
const User = require('./models/user');
const user = require('./models/user');
const session = require('express-session');
const exphbs = require('express-handlebars');
const passport = require('passport');
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const articleRouter = require('./routes/articles');
const userRouter = require('./routes/articles');
const methodOverride = require('method-override');
const app = express();

const url = 'mongodb+srv://root:root@cluster0.r1dqxng.mongodb.net/?retryWrites=true&w=majority';

mongoose.set("strictQuery", false);
mongoose.connect(url).then(() => console.log('connected to MongoDB'))
    .catch(e => console.log(e));

// const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(session({
    secret: 'djfshvu43t623gf27tg8',
    resave: false,
    saveUninitialized: true
}))
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

// function isLoggedIn(req,res,next) {
//     if(req.isAuthenticated()) return next();
//     res.redirect('/')
// }

app.post('/login', passport.authenticate('local', {
    successRedirect: '/articles/index',
    // failureRedirect: '/articles/login?error=true'
    failureRedirect: '/'
}));

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('articles/main', { articles: articles })
})

// app.get('/logout', function (req, res) {
//     req.logout();
//     res.redirect('/');

// })

app.get('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect('/');
    });
});

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/')
// })

app.use('/articles', articleRouter);
app.use('/register', userRouter);
app.listen(8080);