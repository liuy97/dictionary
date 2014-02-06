
/*
 * GET users listing.
 */

exports.search = function(req, res){
  res.render('search', { title: 'query', query: req.query.q });
};