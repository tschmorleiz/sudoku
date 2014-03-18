var Sudoku = Sudoku || {};
Sudoku.Models = Sudoku.Models || {};

Sudoku.Models.User = Backbone.Model.extend({

  urlRoot: "/api/users",


  // login and populate model with user from response
  login: function(callback) {
    var that = this;
    $.post(this.urlRoot + '/login', this.toJSON(), function(user) {
      that.set(user);
      var gameStates = new Sudoku.Models.GameStates(user.gameStates);
      that.set('gameStates', gameStates);
      callback(that);
    })
  },

},

// statics
{
  // get current user as merge of kik and backend data
  current: function (callback) {
    if (Sudoku.currentUser) {
      callback(Sudoku.currentUser);
    } else {
      kik.getUser(function(kikuser) {
        var user = new Sudoku.Models.User({username: kikuser.username});  
        user.login(function(user){
          Sudoku.currentUser = user;
          // clean local strorage from lagacy games
          user.get('gameStates').cleanLocally();
          // merge with data from kik API
          user.set(kikuser);
          callback(user);
        })
      })
    }
  }
});
