var Sudoku = Sudoku || {};

Sudoku.Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'all' : 'all',
    'new': 'newGame',
    'game/:id': 'game',
    'invitations': 'invitations',
  },

  initialize: function() {
    kik.browser.setOrientationLock('portrait');
  },

  switchView: function(user, newView) {
    if (!this.userView) {
      this.userView = new Sudoku.Views.User({model:user});
    }
    if (this.currentView) {
      this.currentView.unbind();
      this.currentView.remove();
    }
    $('#content').append(newView.el);
    this.currentView = newView;
  },


  // home screen
  home: function() {
    var that = this;
    Sudoku.Models.User.current(function(user) {
      // decide where to go
      var view;
      if (user.get('gameStates').length > 0) {
         that.navigate('#all', true);
      } else {
         that.navigate('#new', true);
      }
    })
  },

  all: function() {
    var that = this;
    Sudoku.Models.User.current(function(user) {
      var view = new Sudoku.Views.GameSelect({
        collection: user.get('gameStates'), 
        el: $('<article id="board">')
      });
      that.switchView(user, view);
    })
  },

  // create a new game
  newGame: function() {
    var that = this;
    Sudoku.Models.User.current(function(user) {
      var view = new Sudoku.Views.NewGame({
        el: $('<article id="board">')
      });
      that.switchView(user, view);
    })
  },

  // continue a game
  game: function(id) {
    var that = this;
    Sudoku.Models.User.current(function(user) {
      var gameState = Sudoku.currentUser.get('gameStates').get(id);
      gameState.fetch({
        success: function() {
          gameState.restore();
          var view = new Sudoku.Views.GameState({
            model: gameState,
            el: $('<article id="board">')
          });
          that.switchView(user, view);
        }
      })
    })
  },

  invitations: function() {
    var that = this;
    Sudoku.Models.User.current(function(user) {
      var invitations = new Sudoku.Models.Invitations();
      invitations.fetch({
        success: function(invitations) {
          var view = new Sudoku.Views.Invitations({
            collection: invitations,
            el: $('<article id="board">')
          });
          that.switchView(user, view);
        }
      })
    })
  }
})

$(function(){
  Sudoku.router = new Sudoku.Router();
  Backbone.history.start();
});