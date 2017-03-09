var express= require('express');
var router = express.Router();
var app=express();
app.disable('x-powered-by');//lock info about server
var handlebars=require('express-handlebars').create({defaultLayout:'main'}); //define main.handlebars as our default layout
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');//html defined in views directory is there in main handlebars
//MORE IMPORTS HERE
var mongo=require('mongodb');
app.use(require('body-parser').urlencoded(
{extended:true}
));
var formidable=require('formidable');//formidable is module used to upload files
var credentials=require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));
app.set('port',process.env.PORT||8000);
app.use(express.static(__dirname + '/public')); //get access to public folder with img
app.get('/',function(req,res){ //req=request res=response
	res.render('home'); //refer to home handlebars
});

app.use(function(req,res,next){ //using middleware
	console.log("Looking for URL"+req.url);
	next();
});

app.get('/junk',function(req,res,next){
	console.log('tried to access /junk');
	throw new Error('/junk doesn\'t exist');
});
app.use(function(err,res,req,next){
	console.log('error'+err.message);
	next();
});

app.get('/about',function(req,res){ //req=request res=response
	res.render('about'); //refer to about handlebars
});



app.get('/file-upload',function(req,res){
	var now=new Date;
	res.render('file-upload',{
		year:now.getFullYear(),
		month:now.getMonth()
	});
});

app.post('/file-upload/:year/:month',
	function(req,res){
		var form=new formidable.IncomingForm();
		form.parse(req,function(err,fields,file){
			if(err)
				return res.redirect(303,'/error');
			console.log('Received File');
			console.log('Place: '+req.body.place);
			console.log(file);
			res.redirect(303,'/thankyou');
	});
});


app.get('/share',function(req,res){
	res.render('share',{csrf:'CSRF token here'});
});


app.post('/addex', function(req, res){
    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongo.MongoClient;  
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/travelshare';
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
        // Get thecollection
        var collection = db.collection('user_experience');
 
        // Get the data passed from the form
        var ex1 = {name: req.body.Username, place: req.body.place,
          experience: req.body.experience};
 
        // Insert the data into the database
        collection.insert([ex1], function (err, result){
          if (err) {
            console.log(err);
          } else {
 
            // Redirect to the updated student list
            res.redirect(303,'/thankyou');
          }
 
          // Close the database
          db.close();
        });
 
      }
    });
  });



app.get('/thelist', function(req, res){
 
  // Get a Mongo client to work with the Mongo server
  var MongoClient = mongo.MongoClient;
 
  // Define where the MongoDB server is
  var url = 'mongodb://localhost:27017/travelshare';
 
  // Connect to the server
  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the Server', err);
  } else {
    // We are connected
    console.log('Connection established to', url);
 
    // Get the documents collection
    var collection = db.collection('user_experience');
 
    // Find all students
    collection.find({}).toArray(function (err, result) {
      if (err) {
        res.send(err);
      } else if (result.length) {
        res.render('exp_list',{
 
          // Pass the returned database documents to Jade
          "exp_list" : result
        });
      } else {
        res.send('No documents found');
      }
      //Close connection
      db.close();
    });
  }
  });
});







app.get('/thankyou',function(req,res){
	res.render('thankyou');
});

app.use(function(req,res){
	res.type('text/html');
	res.status(404);
	res.render('404');
});

app.use(function(err,req,res,next){
	console.error(error.stack);
	res.status(500);
	res.render('500');
});




app.listen(app.get('port'),function(){
	console.log("express started on http://localhost:"+app.get('port')+"press ctrl+c to exit");
});



module.exports = router;