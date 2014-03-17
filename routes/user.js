var User  = require('../models/user');

// POST login with username by setting session
exports.login = function(req, res) {
  var data = req.body;
  User.findOneOrCreate(data.username)
    .then(function(user) {
      req.session.userId = user.id;
      res.json(user);
    })
    .catch(function(err) {
      res.status(err.code || 500);
      res.json(err);
    })
    .done();
};
