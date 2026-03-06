const {StatusCodes}  = require('http-status-codes')
const {BadRequestError, UnauthenticatedError} = require('../errors')
const User = require('../models/User');


const register = async (req, res) => {
    const user = await User.create({...req.body})
    const token = await user.createJWT()
    res.status(StatusCodes.CREATED).json({user})
}

const login = async(req, res) => {
    const {email, password} = req.body;
    if (!email || !password){ throw new BadRequestError('please provide email and password')}
    const user = await User.findOne({email})
    if (!user){throw new UnauthenticatedError('please provide email and password')}  
    
    const isPassCorrect = user.comparePassword(password)
    if (!isPassCorrect){
        throw new UnauthenticatedError('please provide email and password')
    }
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({user:{name:user.name}, token})
}

const logout = async(req, res) => {
    res.status(200).json({msg: 'User logged out successfully'});
}

module.exports = {
    register,
    login,
    logout
}