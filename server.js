//DEPENDENCIES
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 4000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// handlebars
// var exphbs = require("express-handlebars");

// app.engine("handlebars", exphbs({
//   defaultLayout: "main"
// }));
// app.set("view engine", "handlebars");

// var routes = require("./controllers/articles_controller");

// app.use(routes);

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/week18Populater");


// Routes
// Retrieve data from the db
// app.get("/all", function(req, res) {
//   // Find all results from the scrapedData collection in the db
//   db.scrapedData.find({}, function(error, found) {
//     // Throw any errors to the console
//     if (error) {
//       console.log(error);
//     }
//     // If there are no errors, send the data to the browser as json
//     else {
//       res.json(found);
//     }
//   });
// });

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https:/www.nytimes.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Save an empty result object
       var result = [];
    // Now, we grab every h2 within an article tag, and do the following:
    $("p.title").each(function(i, element) {
      
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
    
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          console.log(result)

        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);

        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
  console.log(result)
});

// Route for getting all Articles from the db 
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({ })
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
      console.log("articles")
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function(req, res) {
   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
   db.Article.findOne({ _id: req.params.id })
   // ..and populate all of the comment associated with it
   .populate("comment")
   .then(function(dbArticle) {
     // If we were able to successfully find an Article with the given id, send it back to the client
     res.json(dbArticle);
   })
   .catch(function(err) {
     // If an error occurred, send it to the client
     res.json(err);
   });
});

// Route for saving/updating an Article's associated comment
app.post("/articles/:id", function(req, res) {
   // Create a new comment and pass the req.body to the entry
   db.Comment.create(req.body)
   .then(function(dbComment) {
     
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { Comment: dbComment._id }, { new: true });
   })
   .then(function(dbArticle) {
     // If we were able to successfully update an Article, send it back to the client
     res.json(dbArticle);
   })
   .catch(function(err) {
     // If an error occurred, send it to the client
     res.json(err);
   });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});