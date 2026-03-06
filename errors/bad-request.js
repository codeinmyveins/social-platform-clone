const CustomAPIError = require('./customApi')
const {StatusCodes} = require('http-status-codes')

class BadRequestError extends CustomAPIError{
    constructor(message){
        super(message);
        this.statuscode = StatusCodes.BAD_REQUEST;
    }
}
module.exports = BadRequestError;