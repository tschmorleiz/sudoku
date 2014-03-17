var Sudoku = Sudoku || {};
Sudoku.Models = Sudoku.Models || {};

// model for an invitation
Sudoku.Models.Invitation = Backbone.Model.extend({
  urlRoot: '/api/invitations',

  accept: function(cb) {
    this.save({'status': 'accepted'}, {
      success: cb
    })
  },

  reject: function(cb) {
    this.save({'status': 'rejected'}, {
      success: cb
    })
  }
});

// collection of invitations
Sudoku.Models.Invitations = Backbone.Collection.extend({
  model: Sudoku.Models.Invitation,
  url: '/api/invitations'
});
