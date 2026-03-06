const CustomAPIError = require('./customApi')
const {StatusCodes} = require('http-status-codes')

class UnauthenticatedError extends CustomAPIError {
    constructor(message){
        super(message)
        this.statuscode.StatusCodes.UNAUTHORIZED
    }
}

module.exports = UnauthenticatedError;