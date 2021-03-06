if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}

//const { hash } = require('bcrypt');
const express = require('express')
const app = express()
const bcrypt = require('bcrypt') 
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('./passport-config')
const methodOverride = require('method-override')

initializePassport(
    passport, 
    email =>  users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []; //save in a database
app.set('view-engine', 'ejs')

//app.use(express.json()) 
app.use(express.urlencoded({ extended: false})) //take email and password from input and use them in post
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => 
{
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) =>
{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})


app.post('/register', checkNotAuthenticated, async (req, res) =>{
    try{ 
        const hashedPassword = await bcrypt.hash(req.body.password, 10)  //auto generates a salt (10 rounds)
        users.push({
            id: Date.now().toString(),   //if had database, don't worry about this step
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')  //if successfull, redirect to login page
    } catch{
        res.redirect('/register')   //if failed, stay on register page
    } 
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
}) 

//if user is already authenticated, return true, go to next 
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

//if user is not authenticated, do not allow past homepage
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()) {
        //If authenticated, go to homepage
        return res.redirect('/')
    }
    next()
}


app.listen(3000)

