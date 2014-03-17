var Q = require('q');
var mongoose = require('mongoose-q')(require('mongoose'));
var cleaner = require('../utils/json-cleaner');
var User = require('./user');
var Game = require('./game');


// Schema for sharing a game
var Schema   = mongoose.Schema;
var invitationSchema = new Schema({
  inviter    : {type: Schema.Types.ObjectId, ref: 'User'},
  invitee    : {type: Schema.Types.ObjectId, ref: 'User'},
  game       : {type: Schema.Types.ObjectId, ref: 'Game'},
  status     : {type: String, default: 'pending'}
});

// cleanup JSON for serialization
invitationSchema.options.toJSON = {
    transform: cleaner.transform
};


// reject invitation
invitationSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.saveQ();
};


// accept invitition by joining the game
invitationSchema.methods.accept = function() {
  this.status = 'accepted';
  var promise = this.saveQ()

    // first populate game
    .then(function(invitation){
      return invitation.populateQ({
        path: 'game',
        model: 'Game',
        select: 'name initial'
      });
    })

    // next populate user
    .then(function(invitation) {
      return invitation.populateQ('invitee');
    })

    // finally, let user join game
    .then(function(invitation) {
      return invitation.invitee.joinGameQ(invitation.game)
    });

  return promise;
};


// accept or reject a given invitation (by id)
invitationSchema.statics.findAndAcceptOrReject = function(data) {
  var promise = this.findByIdQ(data.id)
    .then(function(invitation) {
      if (!invitation)
       throw {message: "Invitation not found!", code: 404};
      if (data.status === 'accepted') {
        return invitation.accept();
      } else {
        return invitation.reject();
      }
    });

  return promise;
};

// find all invitations sent to a given invitee
invitationSchema.statics.findByInvitee = function(inviteeId) {
  var deferred = Q.defer();
  var promise = deferred.promise;
  // since populateQ does not work on collections we have to use callbacks
  this.find({invitee: inviteeId, status: 'pending'})
    .populate({path: 'game', select: 'name'})
    .populate({path: 'inviter', select: 'username'})
    .exec(function(err, invitations) {
        if (!err) {
          deferred.resolve(invitations)
        } else {
          deferred.reject(err)
        }
    });

  return promise;
};


var Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
