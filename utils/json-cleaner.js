// remove __v attribute and convert _id to id
exports.transform = function(doc, ret, options) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
}