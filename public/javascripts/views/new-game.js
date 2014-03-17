var Sudoku = Sudoku || {};
Sudoku.Views = Sudoku.Views || {};

// view for creating a new game for a user
Sudoku.Views.NewGame = Backbone.View.extend({

    events: {
        'click input[type="submit"]': 'create'
    },

    initialize:function (options) {
        this.render();
    },

    render:function () {
        $(this.el).html(_.template($('#new-game-form-template').html()));
    },

    // create a new game and navigate to the initial board
    create: function(e) {
        e.preventDefault();
        var name = $(this.el).find('input[type="text"]').val()
        if (name === '') return;
        var game = new Sudoku.Models.Game({name: name});

        $(this.el).html("Generating new puzzle...");
        game.save({}, {
            success: function(game, gameState) {
                // game was saved, but response is initial gameState
                Sudoku.currentUser.get('gameStates').add(gameState);
                window.location = "#game/" + game.id
            }
        });
    }

});
