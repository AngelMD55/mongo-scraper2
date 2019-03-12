require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");
const bodyParser = require("body-parser");

const exphbs = require("express-handlebars")

const PORT = process.env.PORT || 3000;

const app = express();

// mongoose connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

//express-handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//routes
// require("./routes/api_routes")(app);
require("./routes/html_routes")(app);


app.get("/scrape", function (req, res) {
    axios.get("https://magazine.realtor/daily-news").then(function (response) {
        let $ = cheerio.load(response.data);


        $("article .layout-slat__header h3 ").each(function (i, element) {
            let result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
                
            result.summary = $($(this)
                .parent()
                .parent()
                .find(".layout-slat__main-content")[0])
                .children("p")
                .text()
            result.url = ("https://magazine.realtor" + result.link)
            // console.log(result)

            db.Article.create(result)
              .then(function(dbArticle){
                  console.log(dbArticle)
              })
              .catch(function(err){
                  console.log(err);
              });
        });

        res.send("Scrape Complete")
    });
});

app.get("/articles", function(req, res){
    db.Article.find({})
      .then(function(dbArticle){
          res.json(dbArticle)
      })
      .catch(function(err){
          res.json(err)
      });
});

app.get("/savedapi", function(req, res){
    db.Article.find({saved: true})
    .then(function(dbArticle){ 
        res.json(dbArticle)
    })
    .catch(function(err){
        res.json(err)
    });
});

app.get("/articles/:id", function(req, res){

    db.Article.findOne({_id: req.params.id})
      .populate("note")
      .then(function(dbArticle){
          res.json(dbArticle);
      })
      .catch(function(err){
          res.json(err);
      });
});

app.put("/articles/:id", function(req, res){
    // console.log(req.params.id)
    db.Article.findOne({_id: req.params.id})
    .then(function(data){
        // console.log(data);
        // console.log(data.saved);

        if (data.saved === "true"){
            db.Article.findByIdAndUpdate({_id: req.params.id},{saved:false})
            .then(function(dbArticle){
                res.json(dbArticle);
                // console.log(dbArticle)
            })
            .catch(function(err){
                res.json(err);
            });
            }else{
                db.Article.findByIdAndUpdate({_id: req.params.id},{saved:true})
                .then(function(dbArticle){
                    res.json(dbArticle);
                    // console.log(dbArticle)
                })
                .catch(function(err){
                    res.json(err);
                });
            }
    })
});

app.post("/articles/:id", function(req, res){
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findByIdAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new:true});
    })
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

app.listen(PORT, function () {
    console.log("Server listening on: http://localhost:" + PORT);
})

