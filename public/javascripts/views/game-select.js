var Sudoku = Sudoku || {};
Sudoku.Views = Sudoku.Views || {};

// view for selecting games
Sudoku.Views.GameSelect = Backbone.View.extend({

    initialize: function() {
        this.render();
    },

    // render form template
    render: function () {
        var template = Handlebars.compile($('#game-select-template').html());
        var html = template({gameStates: this.collection.toJSON()});
        $(this.el).html(html);
    },

});
