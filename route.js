const express = require('express')
const router = express.Router()
const path = require("path")
const session = require('express-session');
const bodyParser = require('body-parser');
const news = require('./data/news')
const broadcast = require('./data/broadcast')
const showcase = require('./data/showcase')
const gallery = require('./data/gallery')
const academic = require('./data/academic');
const store = require("store2");


router.use(bodyParser.urlencoded({
    extended: false
}))

router.use(session({
    secret: 'token',
    cookie: {
        maxAge: 60000000
    },
    resave: true,
    saveUninitialized: false
}))

function user(username, password) {
    if (username == "admin" && password == "1234") {
        return true;
    } else {
        return false;
    }
}

router.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, "/public/views/login.html"));
})

router.get('/contact', function (req, res) {
    let localData = store.getAll()
    res.render('contact.ejs', {localData:localData})
})

router.post('/contact', function (req, res) {
    store('Profile', {email: req.body.email, message: req.body.message});
    res.redirect('/contact')
})


router.post('/login', function (req, res) {
    const _username = req.body.username
    const _password = req.body.password
    
    if (req.session.isLoggedIn != null && req.session.isLoggedIn == true) {
        res.redirect("/")
    }


    if (user(req.body.username, req.body.password) == true) {
        req.session.username = req.query.username
        req.session.isLoggedIn = true
        res.redirect("/")
    } else {
        res.sendFile(path.join(__dirname, "/public/views/login.html"));
    }
})


router.get('/', (req, res) => {
    res.render('index.ejs', {news:news, broadcast:broadcast, showcase:showcase})
    console.log(news)
    console.log(broadcast)
    console.log(showcase)
})

router.get('/news', (req, res) => {
    res.render('news.ejs', {news:news})
    console.log(news)
})

router.get('/academic', (req, res) => {
    if (req.session.isLoggedIn != null && req.session.isLoggedIn == true) {  
        res.render('academic.ejs', {academic:academic})
        console.log(academic)
    } else {
        res.redirect('/login')
    }
})

router.get('/showcase', (req, res) => {
    res.render('showcase.ejs', {showcase:showcase})
    console.log(showcase)
})

router.get('/gallery', (req, res) => {
    res.render('gallery.ejs', {gallery:gallery})
    console.log(gallery)
})

router.get('/news/:id', (req, res) => {
    let found = news.some(news => news.id === parseInt(req.params.id))  
    if (found) {
        const currentnews = news.filter(news => news.id === parseInt(req.params.id))
        res.render('news_details.ejs', {news:currentnews})
        console.log(currentnews)
    } else {
         res.redirect('/error')
    }
})

router.get('/showcase/:id', (req, res) => {
    let found = showcase.some(showcase => showcase.id === parseInt(req.params.id))  
    if (found) {
        const currentshowcase = showcase.filter(showcase => showcase.id === parseInt(req.params.id))
        res.render('showcase_details.ejs', {showcase:currentshowcase})
        console.log(currentshowcase)
    } else {
         res.redirect('/error')
    }
})

router.get('/gallery/:id', (req, res) => {
    let found = gallery.some(gallery => gallery.id === parseInt(req.params.id))
    if (found) {
        res.download(path.join(__dirname, './public/image/download/' + req.params.id + '.png'))
    } else {
        res.redirect('/error')
    }
})

router.get('/academic/:id', (req, res) => {
    if (req.session.isLoggedIn != null && req.session.isLoggedIn == true) {  
        let found = academic.some(academic => academic.id === parseInt(req.params.id))
        if (found) {
            res.download(path.join(__dirname, './public/assets/academic' + req.params.id + '.pdf'))
        } else {
        res.redirect('/error')
        }
    } else {
        res.redirect('/login')
    }
})

router.get('/broadcast/:id', (req, res) => {
    let found = broadcast.some(broadcast => broadcast.id === parseInt(req.params.id))  
    if (found) {
        const currentbroadcast = broadcast.filter(broadcast => broadcast.id === parseInt(req.params.id))
        res.render('broadcast_details.ejs', {broadcast:currentbroadcast})
        console.log(currentbroadcast)
    } else {
         res.redirect('/error')
    }
})

router.post('/logout', function (req, res) {
    req.session.destroy(); //ทิ้ง session
    res.redirect("/login");
    console.log("TEST")
})

module.exports = router