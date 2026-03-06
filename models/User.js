const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                ]    
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6
    }
});

User.pre('save', async function() {
    if(!this.isModified('password')) {
        next()
    };
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
});

User.methods.createJWT = function(){
    return jwt.sign({userId:this._id,name:this.name,email:this.email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME})
}

User.methods.comparePassword = async function(candidatePasswrod){
    const isMatch = await bcrypt.compare(candidatePasswrod,this.password);
    return isMatch;
}

module.exports = mongoose.model('User', User);