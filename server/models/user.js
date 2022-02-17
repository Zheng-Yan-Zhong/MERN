const mongoose = require('mongoose')

const User = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    created: {
        type: Date,
        default: new Date().toDateString()
    }
})

const UserModel = new mongoose.model('User', User)

module.exports = UserModel