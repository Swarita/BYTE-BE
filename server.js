const { hash } = require('bcrypt');
const express = require('express')
const app = express()
app.use(express.json()) 
const bcrypt = require('bcrypt') 

const users = []; //save in a database
/*app.get('/', (req, res) => 
{
    res.render('index.ejs')
})*/
app.get('/users', (req, res) =>
{
    res.json(users)
})

//create users and get request and response
app.post('/users', async (req, res) =>
{
    try 
    {
         
        const hashedPassword = await bcrypt.hash(req.body.password, 10)  //auto generates a salt (10 rounds)
        const user = {name: req.body.name, password: hashedPassword}
        users.push(user)
        res.status(201).send()
    } catch
    {
        res.status(500).send()
    }  
})

app.post('/users/login', async (req, res) =>
{
    //matching up the name sent in to name in database
    const user = users.find(user => user.name = req.body.name)
    if(user == null)
    {
        return res.status(400).send('Cannot find the username')
    }
    //compare input to password of user
    try
    {
                        //name pass         user input
        if(await bcrypt.compare(req.body.password, user.password))
        {
            //password is the same
            res.send('Success')
        }
        else
        {
            res.send('Not allowed')
        }
    }catch
    {
        res.status(500).send()
    }

})

app.listen(3000)