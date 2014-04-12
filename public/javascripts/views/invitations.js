var Sudoku = Sudoku || {};
Sudoku.Views = Sudoku.Views || {};

Sudoku.Views.Invitation = Backbone.View.extend({

  events: {
    "click .accept": "accept",
    "click .reject": "reject",
  },
 
  // accept invitation and go to new game
  accept: function(e){
    var that = this;
    e.preventDefault();
    this.model.accept(function(invitation, gameState) {
        that.unbind();
        that.remove();
        Sudoku.currentUser.get('gameStates').push(gameState);
        window.location = "#game/" + gameState.id
    });
  },

  // reject invitation and go to game list
  reject: function(e){
    var that = this;
    e.preventDefault();
    this.model.reject(function() {
        that.unbind();
        that.remove();
        window.location = "#"
    });
  },
 
  render: function(){
    var template = Handlebars.compile($('#invitation-template').html());
    var html = template({invitation: this.model.toJSON()});
    $(this.el).html(html);
  }
});


// view for invitations
Sudoku.Views.Invitations = Backbone.View.extend({

    render: function () {
        var that = this;
        $(this.el).html('<h1>Your invitations</h1>');
        
        if (this.collection.isEmpty()) {
          $(this.el).append('<i class="empty-list">Currently no invitations</i>');  
        } else {
          var list = $('<ul class="app-list" id="invitations">')
          this.collection.each(function(invitation) {
            var invitationView = new Sudoku.Views.Invitation({model: invitation, el: $('<li>')});
            invitationView.render();
            $(list).append(invitationView.el)
          })
        }
        $(this.el).append(list);
    },

});
