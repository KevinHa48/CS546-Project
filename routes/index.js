const marketRoutes = require('./market');
const walletRoutes = require('./wallet');
const industryRoutes = require('./industry');
const stockRoutes = require('./stock');
const path = require('path');

const constructorMethod = (app) => {
    app.use('/market', marketRoutes);
    app.use('/wallet', walletRoutes);
    app.use('/industries', industryRoutes);
    app.use('/industry', stockRoutes)
    app.get('/', (req, res) => {
        res.sendFile(path.resolve('static/home.html'));
    });

    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
}

module.exports = constructorMethod;