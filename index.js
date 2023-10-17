const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")
const collection = require("./mongodb")
const port = process.env.PORT || 3000
const session = require('express-session');
app.use(session({
    secret: 'A21025',
    resave: false,
    saveUninitialized: false
  }));
  
app.use(express.json())
app.set("view engine", "hbs")
app.use(express.urlencoded({extended:false}))

const templatePath = path.join(__dirname, '../templates')
const publicPath = path.join(__dirname, '../public')

app.set('views', templatePath)
app.use(express.static(publicPath))
app.use(express.static(path.join(__dirname, 'public')));


app.get("/",(req,res)=>{
    res.render("loginpage")
})

app.get("/signuppage",(req,res)=>{
    res.render("signuppage")
})

app.get("/loginpage", (req, res) => {
    res.render("loginpage");
  });
  
app.get("/about", async(req,res)=>{
    try {
        const userEmail = req.session.userEmail;
        const user = await collection.findOne({ email: userEmail });
        res.render("about", { username: user ? user.username : "Guest" });
      } catch (error) {
        res.render("about", { username: "Guest" });
      }
})

app.get("/arts", async(req,res) => {
    try {
        const userEmail = req.session.userEmail;
        const user = await collection.findOne({ email: userEmail });
        res.render("arts", { username: user ? user.username : "Guest", items });
      } catch (error) {
        res.render("arts", { username: "Guest" });
      }
})

app.get("/cart", async(req,res) => {
    try {
        const userEmail = req.session.userEmail;
        const user = await collection.findOne({ email: userEmail });
        res.render("cart", { username: user ? user.username : "Guest", cart });
      } catch (error) {
        res.render("cart", { username: "Guest" });
      }
})

const items = [
    { id: 1, name: 'Art 1', price: 10 },
    { id: 2, name: 'Art 2', price: 15 },
    { id: 3, name: 'Art 3', price: 20 },
    { id: 4, name: 'Art 4', price: 25 },
    { id: 5, name: 'Art 5', price: 30 },
    { id: 6, name: 'Art 6', price: 35 },
    { id: 7, name: 'Art 7', price: 40 },
    { id: 8, name: 'Art 8', price: 45 },
    { id: 9, name: 'Art 9', price: 50 },
  ];
  
  // Cart data
  let cart = [];
  
  
  app.get('/add-to-cart/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const selectedItem = items.find(item => item.id === itemId);
  
    if (selectedItem) {
      cart.push(selectedItem);
    }
  
    res.redirect('/cart');
  });

app.get("/homepage", async (req, res) => {
    try {
      const userEmail = req.session.userEmail;
      const user = await collection.findOne({ email: userEmail });
      res.render("homepage", { username: user ? user.username : "Guest" });
    } catch (error) {
      res.render("homepage", { username: "Guest" });
    }
  });
  

app.post("/signuppage", async(req,res)=>{
    const data = {
        email: req.body.email,
        username: req.body.uname,
        password: req.body.cpwd
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let checkemail = req.body.email;
    let isValidEmail = emailPattern.test(checkemail);

   try{
    if(!isValidEmail){
        return res.send("Only email should be entered!")
    }
    if(req.body.pwd !== req.body.cpwd){
        return res.send("Passwords do not match!")
    }
    const checking = await collection.findOne({ email: req.body.email })
    if (checking) {
        return res.send("User details already exists")
    }
    await collection.insertMany([data])
    res.status(201).render("loginpage", {
        naming: req.body.uname
    })
   }
   catch(error){
    console.error(error)
    return res.send("Wrong inputs")
   }
})

app.post('/loginpage', async (req, res) => {
    const user = {email: req.body.email};
    req.session.userEmail = user.email;
    try {
        const check = await collection.findOne({ email: req.body.email })
       if (check.password === req.body.pwd) {
            // res.status(201).render("homepage", { naming: `${req.body.pwd}+${req.body.email}` })
            res.redirect("homepage")
        }
        else {
            res.send("Incorrect password")
        }
    }    
    catch (e) {
        res.send("Wrong details")
    }
})
  
app.listen(port,()=>{
    console.log("Port Connected")
})
