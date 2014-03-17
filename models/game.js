var sudoku = require('sudoku');
var mongoose = require('mongoose-q')(require('mongoose'));
var cleaner = require('../utils/json-cleaner');
var User = require('./user');
var Invitation = require('./invitation');


// Schema for games
var Schema   = mongoose.Schema;
var gameSchema = new Schema({
  name        : String,
  initial     : Array,
  solution    : Array,
  creator     : {type: Schema.Types.ObjectId, ref: 'User'},
});

// cleanup JSON for serialization
gameSchema.options.toJSON = {
    transform: cleaner.transform
};


// convert flat board array to list of rows
gameSchema.statics.array2Board = function(array) {
  var rows = [];
  while (array.length) {
    rows.push(array.splice(0, 9).map(function(x){
      return (x === null) ? null : x + 1;
    }));
  }
  return rows;
};


// create a new random game for user
gameSchema.statics.createRandom = function(name, creatorId) {
  var promise = User.findByIdQ(creatorId)
    .then(function(creator) {
      if (name === '') {
        throw {message: "Game name must not be empty!", code: 422};
      }
      // create new random game
      var board = sudoku.makepuzzle();
      var solution = sudoku.solvepuzzle(board);
      var game = new Game({
        name: name,
        initial: Game.array2Board(board),
        solution: Game.array2Board(solution),
        creator: creator.id
      });
      // save and let creator join (returning initial game state)
      return game.saveQ()
        .then(function(game){
          return creator.joinGameQ(game);
        });
    })

  return promise;
};


var Game = mongoose.model('Game', gameSchema);

module.exports = Game;
