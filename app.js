const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const session = require('express-session')

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(session({
    name: "AuthCookie",
    secret: "$8r}{W04X,a%x>]L]1zA",
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 900000} // 15 minutes
}))

app.use('/', async (req, res, next) => {
    const routePath = req.path.split('/')
    const loggedIn = !!req.session.user
    if (req.method !== 'GET') {
        next()
        return
    }

    if (!loggedIn && (routePath[1] !== 'users' && routePath[1] !== '')) {
        // alert('You must be logged in to access that page.')
        res.redirect('/users/login')
    } else if (loggedIn && routePath[1] === 'users' && routePath[2] !== 'logout') {
        // alert('You are already logged in.')
        res.redirect('/')
    } else {
        next()
    }
})

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});