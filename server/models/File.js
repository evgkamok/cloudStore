const {Schema, model, ObjectId} = require("mongoose");

const File  = new Schema({
  name: {type: String, require: true},
  type: {type: String, require: true},
  accessLink: {type: String},
  path: {type: String, default: ''},
  size: {type: Number, default: 0},
  date: {type: Date, default: Date.now()},
  user: {type: ObjectId, ref: "User"},
  parent: {type: ObjectId, ref: "File"},
  child: [{type: ObjectId, ref: "File"}]
})


module.exports = model('File', File)