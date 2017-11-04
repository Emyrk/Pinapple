// pull in our models. This will automatically load the index.js from that folder
//const models = require('../models');

// function to handle requests to the main page
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const hostIndex = (req, res) => {
  res.render('index', {
    title: 'Pinapple',
    pageName: 'Pinapple Main Page',
  });
};

const hostShare = (req, res) => {
  res.render('share');
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  share: hostShare,
};
