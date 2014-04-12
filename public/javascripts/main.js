var Sudoku = Sudoku || {};

Sudoku.Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'new': 'newGame',
    'game/:id': 'game',
    'invitations': 'invitations',
  },

  initialize: function() {
    kik.browser.setOrientationLock('portrait');
  },

  switchView: function(user, newView, page, transition) {
    var that = this;
    if (this.currentView) {
      this.currentView.unbind();
      this.currentView.remove();
    } else {
      transition = 'fade';
    }
    App.load(page, transition, function() {
      newView.render();
      $('#' + page).html(newView.el);
      that.currentView = newView;
    });
  },


  // home screen
  home: function() {
    var that = this;
    Sudoku.Models.User.current(function(user) {
      var view = new Sudoku.Views.GameSelect({
        collection: user.get('gameStates'), 
        el: $('<article id="board">')
      });
      that.switchView(user, view, 'home', 'slide-right');
    })
  },

  // create a new game
  newGame: function() {
    var that = this;
    Sudoku.Models.User.current(function(user) {
      var view = new Sudoku.Views.NewGame({
        el: $('<article id="board">')
      });
      that.switchView(user, view, 'new-game', 'slide-left');
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
          that.switchView(user, view, 'game', 'slide-left');
        }
      })
    })
  },

})

$(function(){
  Sudoku.router = new Sudoku.Router();
  Backbone.history.start();
});