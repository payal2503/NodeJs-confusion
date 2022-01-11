const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const leaderSchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    image:{
        type: String,
        required: true
    },
    designation:{
        type: String,
        required: true
    },
    abbr:{
        type: String,
        required: true
    },
    description:{
        required: true,
        type: String
    },
    featured:{
        type: Boolean,
        required: true,
        default: false
    }
},{
    Timestamps: true
});

var Leaders = mongoose.model('Leaders', leaderSchema);
module.exports = Leaders ;
