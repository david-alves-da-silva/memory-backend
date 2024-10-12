const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
