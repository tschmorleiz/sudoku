var Sudoku = Sudoku || {};
Sudoku.Models = Sudoku.Models || {};

Sudoku.Models.Game = Backbone.Model.extend({

  urlRoot: "/api/games",
});
