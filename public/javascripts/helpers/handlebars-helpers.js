// http://stackoverflow.com/questions/11924452/handlebar-js-iterating-over-for-basic-loop
Handlebars.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 0; i < n; ++i)
      accum += block.fn(i);
  return accum;
});

Handlebars.registerHelper('squaretable', function(n, cssclass, block) {
  var accum = '<table class="' + cssclass + '">';
    for(var i = 0; i < n; ++i) {
      accum += '<tr>'
      for(var j = 0; j < n; ++j) {
        accum += '<td>' + block.fn([i,j]) + '</td>';
      }
      accum += '</tr>'
    }
  accum += '</table>';
  return accum;
})