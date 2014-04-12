var Sudoku = Sudoku || {};
Sudoku.Views = Sudoku.Views || {};

// view for selecting games
Sudoku.Views.GameSelect = Backbone.View.extend({

    // render form template
    render: function () {
        var template = Handlebars.compile($('#game-select-template').html());
        var html = template({gameStates: this.collection.toJSON()});
        $(this.el).html(html);
        this.loadInvitations();
    },

    loadInvitations: function() {
	    var that = this;
	    Sudoku.Models.User.current(function(user) {
	      var invitations = new Sudoku.Models.Invitations();
	      invitations.fetch({
	        success: function(invitations) {
	          var view = new Sudoku.Views.Invitations({
	            collection: invitations,
	          });
	          view.render();
	          $('#invitations').html(view.el)
	        }
	      })
	    })
  	}


});
