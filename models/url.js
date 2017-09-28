var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// create the counters schema with an _id field and a seq field
var CounterSchema = Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

// create a model from that schema
var counter = mongoose.model('counter', CounterSchema);

// create a schema for our links
var urlSchema = new Schema({
  _id: { type: Number, index: true },
  url: String
});

// The pre('save', callback) middleware executes the callback function
// every time before an entry is saved to the urls collection.
urlSchema.pre('save', function(next){
  var doc = this;
  // find the url_count and increment it by 1
  counter.findByIdAndUpdate({_id: 'urlid'}, {$inc: {seq: 1} }, function(error, counter) {
      if (error) return next(error);
      // set the _id of the urls collection to the incremented value of the counter
      doc._id = counter.seq;
      next();
  });
});

var Url = mongoose.model('Url', urlSchema);

module.exports = Url;