var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// create the  LibrarySchema object
var CommentSchema = new Schema({
    string: {
        type: String,
        trim: true,  
        required: "Username is Required"
    },
    CommentCreated: {
        type: Date,
        default: Date.now
      },
    });

    var Comment = mongoose.model("Comment", CommentSchema);

    // Export the User model
    module.exports = Comment;