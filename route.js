const express = require('express')
const router = express.Router()
const path = require("path")
const session = require('express-session');
const bodyParser = require('body-parser');
const news = require('./data/news')
const broadcast = require('./data/broadcast')

router.use(bodyParser.urlencoded({
    extended: false
}))

router.get('/', (req, res) => {
    res.render('index.ejs', {news:news, broadcast:broadcast})
    console.Console(news)
})

router.get('/news', (req, res) => {
    res.render('news.ejs', {news:news})
    console.Console(news)
})


module.exports = router