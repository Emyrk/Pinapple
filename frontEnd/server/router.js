// import the controllers
// This only specifies the folder name, which means it will automatically pull the index.js file
const js = require('./js');
// console.dir(controllers);
// function to attach routes
const router = (app) => {
 // pass the express app in
 
    // app.VERB maps get requests to a middleware action
    // For example
    // app.get handles GET requests
    // app.post handles POST requests
    // whenever someone goes to the site without a path (AKA the home page), call controllers.index
    // For example www.webpage.com
  app.get('/share', js.share);
  app.get('/', js.index);


};

// export the router function
module.exports = router;
