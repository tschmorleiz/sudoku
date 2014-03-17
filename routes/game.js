var Game  = require('../models/game');

// POST new game
exports.create = function(req, res){
  var data = req.body;
  var userId = req.session.userId;
  Game.createRandom(data.name, userId)
    .then(function(gameState) {
      res.json(gameState);
    })
    .catch(function(err) {
      console.log(err);
      res.status(err.code || 500);
      res.json(err);
    })
    .done();
};
