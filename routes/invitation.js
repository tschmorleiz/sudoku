var Invitation  = require('../models/invitation');
var User  = require('../models/user');

// generic action performed on Invitation model
function performOnInvitation(action, params, req, res) {
  Invitation[action].apply(Invitation, params)
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.log(err);
      res.status(err.code || 500);
      res.json({message: err.message});
    })
    .done();
};

// POST new invitation
exports.create = function(req, res){
  var data = req.body;
  var userId = req.session.userId;
  User.findOneOrCreate(data.inviteeUsername, userId, data.gameId)
    .then(function(invitee) {
      return invitee.inviteToGameQ(userId, data.gameId)
    })
    .then(function(invitation) {
      res.json(invitation);
    })
    .catch(function(err) {
      console.log(err);
      res.status(err.code || 500);
      res.json(err);
    })
    .done();

};

// GET all invitations for current user
exports.index = function(req, res) {
  var userId = req.session.userId;
  performOnInvitation('findByInvitee', [userId], req, res);
}

// PUT invitation to accept/reject
exports.update = function(req, res){
  var data = req.body;
  if (data.invitee !== req.session.userId) {
    res.status(401);
    res.json({message: "This is not your invitation!"})
  } else {
    performOnInvitation('findAndAcceptOrReject', [data], req, res);
  }
}