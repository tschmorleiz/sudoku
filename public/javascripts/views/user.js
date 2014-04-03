var Sudoku = Sudoku || {};
Sudoku.Views = Sudoku.Views || {};

// view for the user
Sudoku.Views.User = Backbone.View.extend({

	el: '#user',

    initialize:function () {
        this.render();
    },

    render:function () {
        var template = Handlebars.compile($('#user-template').html());
        var html = template({
        	thumbnail: this.model.get('thumbnail')
        });
        $(this.el).html(html);
    }

});
