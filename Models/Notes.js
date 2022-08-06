const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Branch = require("./Branch");
// const ImageSchema = new Schema({
//     Url: String,
//     FileName: String
// });

// ImageSchema.virtual('thumbnail').get(function() {
//     return this.Url.replace('/upload', '/upload/w_200');
// });
const NotesSchema = new Schema({
    Dept: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    fileName: String,
})
module.exports = mongoose.model("Notes", NotesSchema);