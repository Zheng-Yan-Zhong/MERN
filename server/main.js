const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const db = "mern-User"
const userModel = require('./models/user')
const bcrypt = require('bcrypt')
app.use(express.json())
//request will be json
app.use(cors())
//db
mongoose.connect(`mongodb+srv://root:root@project.bfzl8.mongodb.net/${db}?retryWrites=true&w=majority`)


app.listen(3001, function() {
    console.log("running");
})

//* APIs

app.get('/', function(req, res) {
    res.json('OK')
})

app.post('/user/login', function(req, res) {
    const { username, password } = req.body
    userModel.find({username: username}, function(err, data) {
        if(data.length == 0) {
            return res.json({text: "not found user"})
        } else {
            bcrypt.compare(password, data[0].password, function(error, result) {
                if(result) {
                    res.json({text: true})
                } else {
                    res.json({text: "password error"})
                }
            })
        }
    })
})

app.post('/user/register', function(req, res) {
    const saltTime = 10
    const {username, password, email} = req.body// get request.body
    bcrypt.hash(password, saltTime, function(err, hash) {
    userModel.create({username: username, password: hash, email: email})            
    res.json({res: "success created"}) 
    })
})