const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const ImageSchema = new Schema({
//     Url: String,
//     FileName: String
// });

// ImageSchema.virtual('thumbnail').get(function() {
//     return this.Url.replace('/upload', '/upload/w_200');
// });
const BranchSchema = new Schema({
    CollegeName: String,
    PhoneNumber: Number,
    Email: String,
    HOD: String,
    DepartmentDetails: String,
    Branch: [String],
})
module.exports = mongoose.model("Branch", BranchSchema);