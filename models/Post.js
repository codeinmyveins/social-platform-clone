const mongoose = require('mongoose')

const Post = new mongoose.Schema({
    title:{
        type:String,
        required: [true, 'Please provide title'],
        maxlength:50,
    },
    content:{
        type: String,
        required:[true, 'Please provide content'],
        maxlength:2000
    },
    image: {
        type: String,
        default: ''
    },
    like:{
        type:Number,
        default:0
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
},
{timestamps:true}
)

module.exports = mongoose.model('Post',Post)
