var GameState  = require('../models/gameState');

// generic action performed on GameState model
function performOnGameState(action, params, req, res) {
  GameState[action].apply(GameState, params)
    .then(function(result) {
      if (result.user && result.user != req.session.userId) {
        throw {code: 401, message: "This is not your game status!"};
      }
      res.json(result);
    })
    .catch(function(err) {
      console.log(err);
      res.status(err.code || 500);
      res.json({message: err.message});
    })
    .done();
};

// GET status of game
exports.get = function(req, res){
  var id = req.params.id;
  performOnGameState('findAndPopulate', [id], req, res);
};

// PUT updated status of game
exports.update = function(req, res){
  var id = req.params.id;
  var data = req.body;
  performOnGameState('findAndUpdate', [id, data], req, res);
};

// GET other players' game states (excluding current board)
exports.others = function(req, res){
 var id = req.params.id;
 performOnGameState('findOthers', [id], req, res);
};
