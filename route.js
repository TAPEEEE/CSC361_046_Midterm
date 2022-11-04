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
const mysql = require('mysql')
const connection = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'assignment2'
});

connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = connection;

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
    connection.query("SELECT * FROM timestamp", (err, results) =>{
        res.render("login.ejs", {
            posts: results
        });
        console.log(results);
    });
    
})

router.get('/add', (req, res) => {
    res.render("add.ejs")
})


router.get('/contact', function (req, res) {
    let localData = store.getAll()
    connection.query("SELECT * FROM timestamp", (err, results) =>{
        res.render("contact.ejs", {
            posts: results,
            localData: localData
        });
        console.log(results);
    });
})

router.post('/contact', function (req, res) {
    store('Profile', {email: req.body.email, message: req.body.message});
    res.redirect('/contact')
    
})


router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password)
    if (username && password) {
        connection.query("SELECT * FROM account WHERE username = ? AND password = ?",[username, password], (err, results, fields) => {
                if (results.length > 0) {
                    connection.query("INSERT INTO `timestamp`(`username`, `time`) VALUES" + `('${username}', now());`, function (err, result, fields) {
                        if (err) throw err;
                            console.log(result);
                    });
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/');
                } else {
                    res.send('Incorrect Username and/or Password!');
                }
                res.end();
            }
        );
    } else {
        res.send('Please enter Username and Password')
        res.end()
    }
});

router.post('/add', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    connection.query("INSERT INTO `accounts`(`username`, `password`, `email`) VALUES" + `('${username}','${password}','${email}');`, function (err, result, fields) {
        if (err) throw err;
            console.log(result);
            res.redirect('/contact');
    });
});

router.get('/edit/:id', (req, res) => {
    const edit_postID = req.params.id;

    connection.query(
        "SELECT * FROM account WHERE id=?", 
        [edit_postID],
        (err, results) => {
            if (results) {
                res.render('edit.ejs', {
                    post: results[0],
                });
            }
        }
    );
});
router.post('/edit/:id', (req, res) => {
    const update_username = req.body.username;

    const update_password = req.body.password;
    const update_email = req.body.email;
    const id = req.params.id;
    connection.query(
        "UPDATE account SET username = ?,password = ?,email = ? WHERE id = ?",
        [update_username, update_password, update_email,id],
        (err, results) => {
            if (results.changedRows === 1) {
                console.log("Post Updated");
            }
            return res.redirect('/contact');
        }
    );
});

router.get('/delete/:id', (req, res) => {
    connection.query(
        "DELETE FROM account WHERE id = ?",
        [req.params.id],
        (err, results) => {
            return res.redirect('/contact');
        }
    );
});

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

router.get('/register', (req, res) => {
    res.render("register.ejs")
})

router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    connection.query("INSERT INTO `account`(`username`, `password`, `email`) VALUES" + `('${username}','${password}','${password}');`, function (err, result, fields) {
        if (err) throw err;
            console.log(result);
            res.redirect('/');
    });
});


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