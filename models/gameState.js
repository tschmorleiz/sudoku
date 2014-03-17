var Q = require('q');
var mongoose = require('mongoose-q')(require('mongoose'));
var cleaner = require('../utils/json-cleaner');

// Schema for game states
var Schema   = mongoose.Schema;
var gameStateSchema = new Schema({
  board      : Array,
  stateName  : {type: String, default: 'in_progress'},
  game       : {type: Schema.Types.ObjectId, ref: 'Game'},
  user       : {type: Schema.Types.ObjectId, ref: 'User'},
  started    : {type: Date, default: Date.now},
  finished   : Date
});

// cleanup JSON for serialization
gameStateSchema.options.toJSON = {
    transform: cleaner.transform
};

// minimally populate game just by name and initial board
gameStateSchema.methods.populateGameQ = function(select) {
  var options = {
    path: 'game', 
    model: 'Game',
    select: select
  };
  return this.populateQ(options);
};

// check if board is solved by comparing with solution
gameStateSchema.methods.isSolved = function() {
  console.log(this.board);
  console.log(this.game.solution);
  if (this.board.length !== this.game.solution.length) {
    return false;
  }
  for (var row = 0; row < this.board.length; row++) {
    if (this.board[row].length !== this.game.solution[row].length) {
      return false;
    }
    for (var col = 0; col < this.board[row].length; col++) {
      if (this.board[row][col] === null || 
        this.board[row][col] !== this.game.solution[row][col]) {
        return false;
      }
    }
  }
  return true;
};

// update board and then update statename appropriately
gameStateSchema.methods.updateStatus = function(board, stateName) {
  var that = this;
  var promise = this.populateGameQ('name initial solution')
    .then(function(gameState) {
      gameState.board = board;
      if (gameState.stateName === 'in_progress' && stateName === 'quit') {
        gameState.stateName = 'quit';
      } else {
        var solved = gameState.isSolved();
        if (solved) {
          gameState.stateName = 'solved';
          gameState.finished = Date.now();
        }
      }
      return gameState.saveQ();
    });

  return promise;
};

// find game state and populate actual game (name and initial board only)
gameStateSchema.statics.findAndPopulate = function(id) {
  var promise = this.findByIdQ(id)
    .then(function(gameState) {
      if (!gameState)
       throw {message: "Game state not found!", code: 404};
      return gameState.populateGameQ('name initial');
     });

  return promise;
};

// update game state and possibly quit
gameStateSchema.statics.findAndUpdate = function(id, data) {
  var promise = this.findByIdQ(id)
    .then(function(gameState) {
      if (!gameState)
        throw {message: "Game state not found!", code: 404};
      return gameState.updateStatus(data.board, data.stateName);
    });

  return promise;
};

// find other player's game states (excluding current board)
gameStateSchema.statics.findOthers = function(id) {
  var that = this;
  var deferred = Q.defer();
  var promise = deferred.promise;
  this.findByIdQ(id)
    .then(function(gameState) {
      if (!gameState)
        throw {message: "Game state not found!", code: 404};
      var options = {
        path: 'user', 
        model: 'User',
        select: 'username'
      };
      // since populateQ does not work on collections we have to use callbacks
      that.find({game: gameState.game}, '-board')
        .populate(options)
        .exec(function(err, gameStates) {
          if (!err) {
            deferred.resolve(gameStates);
          } else {
            deferred.reject(err);
          }
        });
    })

  return promise;
};

module.exports = mongoose.model('GameState', gameStateSchema);
