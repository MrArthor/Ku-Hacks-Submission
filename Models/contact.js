const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const ImageSchema = new Schema({
//     Url: String,
//     FileName: String
// });

// ImageSchema.virtual('thumbnail').get(function() {
//     return this.Url.replace('/upload', '/upload/w_200');
// });
const ContactSchema = new Schema({
    name: String,
    phone: Number,
    email: String,
    query: String,
    message: String,

})
module.exports = mongoose.model("Contact", ContactSchema);