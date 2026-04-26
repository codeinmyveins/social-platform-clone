const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const authMiddleware = (req,res, next) => {
    const auth = req.headers.authorization
    if(!auth || !auth.startsWith('Bearer ')){throw new UnauthenticatedError('Cannot access')}
    const token = auth.split(' ')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        req.user = {
            userId:payload.userId,
            name:payload.name
        }
        next()
    }catch(error){
        throw new UnauthenticatedError('Authentication invalid')
    }
}

module.exports = authMiddleware