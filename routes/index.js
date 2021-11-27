const marketRoutes = require('./market');
const walletRoutes = require('./wallet');
const userRoutes = require('./users')
const path = require('path');

const constructorMethod = (app) => {
    app.use('/market', marketRoutes);
    app.use('/wallet', walletRoutes);
    app.use('/users', userRoutes)
    app.get('/', (req, res) => {
        // res.sendFile(path.resolve('static/home.html'));
        res.render('home', {authenticated: !!req.session.user, title: 'Beats and Blockchain'})
    });

    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
}

module.exports = constructorMethod;