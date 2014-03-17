var Q = require('q');
var mongoose = require('mongoose-q')(require('mongoose'));
var cleaner = require('../utils/json-cleaner');
var GameState = require('./gameState');
var Invitation = require('./invitation');


// Schema for users
var Schema   = mongoose.Schema;
var userSchema = new Schema({
  username      : String,
  gameStates    : [{type: Schema.Types.ObjectId, ref: 'GameState'}]
});

// cleanup JSON for serialization
userSchema.options.toJSON = {
    transform: cleaner.transform
};


// let the user join a game
userSchema.methods.joinGameQ = function(game) {
  var that = this;
  // create the user's initial game state
  var gameState = new GameState({
    board: game.initial,
    state: 'in_progress',
    game: game.id,
    user: this.id
  });

  // save and populate the game state
  var promise = gameState.saveQ()
    .then(function() {
      that.gameStates.push(gameState.id);
      return that.saveQ()
    })
    .then(function() {
      return gameState.populateGameQ('name initial');
    })

  return promise;
};

// invite user to game
userSchema.methods.inviteToGameQ = function(inviteeId, gameId) {
  var that = this;
  var promise = Invitation.findOneQ({game: gameId, invitee: this.id})
  .then(function(invitation){
    // check if invitation to game already exists
    if (!invitation) {
      var invitation = new Invitation({
        inviter: inviteeId,
        invitee: that.id,
        game: gameId
      })
      return invitation.saveQ();    
    } else {
      throw {message: "User was already invited to this game!", code: 408}
    }
  })

  return promise
};


// find user by username and populate gameStates; if none is found, create one
userSchema.statics.findOneOrCreate = function(username) {
  var that = this;
  var promise = this.findOneQ({username: username})

    // first try to get exisiting user or create new one
    .then(function(user){
      if (!user) {
        return that.createQ({username: username});
      } else {
        var deferred = Q.defer();
        deferred.resolve(user);
        return deferred.promise;
      }
    })

    // next populate list of game state references
    .then(function(user){
      var options = {
        path: 'gameStates', 
        model: 'GameState',
        select: 'started stateName game'
      }
      return user.populateQ(options);
    })

    // finally populate all user's games states by actual game
    .then(function(user) {
      var options = {
        path: 'gameStates.game',
        model: 'Game',
        select: 'name'
      };
      return user.populateQ(options);
    })

  return promise;
};


var User = mongoose.model('User', userSchema);

module.exports = User;
