const express = require("express");
var hbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const http = require('http');
const https = require('https');
var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS
const cors = require("cors");
const session = require('express-session');
var path = require('path');
const app = express();
const fs = require('fs');
var multer = require("multer");
const bodyParser = require("body-parser");
const User = require('./instructor/models/User');
const Profile = require('./student/models/profile');
const Package = require('./student/models/packages');

app.use(cors());
const Razorpay = require('razorpay');


const instance = new Razorpay({
    key_id: 'rzp_live_jUW0xQ7KGG8nsK',
    key_secret: 'n6dND7RnGNnFxDtyEvckgivr',
});




// DB Config
const db = require('./config/keys').mongoURI;



// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const exphbs = hbs.create({
        defaultLayout:'main',
        extname: '.hbs', 
        partialsDir: 'views/partials',
        helpers :{ 
            times: function(n, block) {
                  var accum = '';
                  for(var i = 0; i < n; ++i)
                      accum += block.fn(i);
                  return accum;
               }
            }   
        })

//app.use(redirectToHTTPS([], [], 301));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// express-handlebar
app.engine('.hbs',exphbs.engine);
app.set('view engine', '.hbs');


// static folder
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

//using cors
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.get('/about',(req,res,next)=>{
  res.render("about.hbs")
})

// Routes for instructors
app.use('/', require('./instructor/routes/index.js'));
app.use('/users', require('./instructor/routes/users.js'));


//Routes for students
app.use('/student', require('./student/routes/profile'));

//Routes for package trial
app.use('/trial_package', require('./student/routes/trial_package'));

//Routes for package trial
app.use('/book_package', require('./student/routes/book_package'));



/*--------------------------------------APIS FOR PACKAGES---------------------*/
/*-------------------- POST api*-------------------*/
app.post('/PackageApi',(req,res,next)=>{
  var {hours,validity,mode,participants,sessions,price} = req.body;
  var package = new Package({hours,validity,mode,participants,sessions,price})
  package.save()
  .then(result=>res.status(201).json({result}))
  .catch(err=>console.log(err))        
})
/*-------------------- GET api*-------------------*/
app.get('/PackageApi',(req,res,next)=>{
  Package.find({})
  .then(result=>res.status(201).json(result))
  .catch(err=>console.log(err))
})
/*------------------------ DELETE api for deleting package------------------------------*/
app.delete('/PackageApi',(req,res,next)=>{
  Package.deleteMany({},function(result){
      console.log("deleted");
  })
})




app.get("/order", (req, res) => {
    try {
      const options = {
        amount: 1 * 100, // amount == Rs 10
        currency: "INR",
        receipt: "receipt#1",
        payment_capture: 0,
   // 1 for automatic capture // 0 for manual capture
      };
    instance.orders.create(options, async function (err, order) {
      if (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
    return res.status(200).json(order);
   });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
   }
  });


  app.post("/capture/:paymentId", (req, res) => {
    try {
      return request(
       {
       method: "POST",
       url: `https://${config.RAZOR_PAY_KEY_ID}:${config.RAZOR_PAY_KEY_SECRET}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
       form: {
          amount: 1 * 100, // amount == Rs 10 // Same As Order amount
          currency: "INR",
        },
      },
     async function (err, response, body) {
       if (err) {
        return res.status(500).json({
           message: "Something Went Wrong",
         }); 
       }
        console.log("Status:", response.statusCode);
        console.log("Headers:", JSON.stringify(response.headers));
        console.log("Response:", body);
        return res.status(200).json(body);
      });
    } catch (err) {
      return res.status(500).json({
        message: "Something Went Wrong",
     });
    }
  });






const PORT = process.env.PORT || 5000;

/*
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync('./yogarogya.key','utf8'),
  cert: fs.readFileSync('./fdca413655f05bb4.pem','utf8'),
}, app);
*/
app.listen(PORT);
/*--httpServer.listen(PORT, () => {
    console.log('HTTP Server running on port '+PORT);
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

----*/
