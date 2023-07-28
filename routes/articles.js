// const { application } = require('express');
const express = require('express');
const article = require('./../models/article');
const Article = require('./../models/article')
const user = require('./../models/user');
const User = require('./../models/user')
const comment = require('./../models/comment');
const Comment = require('./../models/comment')
const bcrypt = require('bcrypt');
const router = express.Router();
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const localStrategy = require('passport-local').Strategy;

router.use(session({
  secret: 'djfshvu43t623gf27tg8',
  resave: false,
  saveUninitialized: true
}))

router.use(passport.initialize());
router.use(passport.session());

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

router.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/main', { articles: articles })
})

async function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  const articles = await Article.find().sort({
    createdAt: 'desc'
  })
  res.render('articles/main', { articles: articles });
}

async function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  const articles = await Article.find().sort({
    createdAt: 'desc'
  })
  res.render('articles/index', { articles: articles });
}




router.get('/new', isLoggedIn, (req, res) => {
  res.render('articles/new', { article: new Article() });
});

router.get('/contact', (req, res) => {
  res.render('articles/contact', { article: article });
});

router.get('/login', isLoggedOut, (req, res) => {
  res.render('articles/login');
});


router.get('/index', isLoggedIn, async (req, res) => {
  const articles = await Article.find().sort({
    createdAt: 'desc'
  })
  res.render('articles/index', { articles: articles });
});

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})


router.post("/comments/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).send('Article not found');

  let comment = new Comment({
    name: req.body.name,
    email: req.body.email,
    comment: req.body.comment,
    slug: article.slug
  })
  try {
    comment = await comment.save()
    let comments = await Comment.find({ slug: req.params.slug }).sort({ createdAt: 'desc' })
    res.redirect(`/articles/${article.slug}`)
  } catch (e) {
    console.log(e)
    res.render('/', { article: article })
  }
});


router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  let comments = await Comment.find({ slug: req.params.slug }).sort({ createdAt: 'desc' })
  try {
    if (article == null) res.redirect('/')
    res.render('articles/show', { article: article, comments: comments })
  } catch (e) {
    console.log(e)
    res.render('articles/show', { article: article, comments: comments })
  }
  
})


router.post('/', async (req, res) => {
  let article = new Article({
    title: req.body.title,
    description: req.body.description,
    markdown: req.body.markdown,
    image: req.body.image,
    readtime: req.body.readtime
  })
  try {
    article = await article.save()
    res.redirect(`/articles/${article.slug}`)
  } catch (e) {
    console.log(e)
    res.render('articles/new', { article: article })
  }
});

router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.redirect('/articles/index');
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.image = req.body.image
    article.readtime = req.body.readtime
    try {
      article = await article.save()
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}


module.exports = router
