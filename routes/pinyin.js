
/*
 * GET users listing.
 */
var pinyin = require("pinyinjs");
exports.pinyin = function(req, res){
  //console.log(pinyin(req.query.q));
  res.render('pinyin', { title: 'pinyin', hanzi: req.query.q, pinyin: pinyin(req.query.q).toString() });
  //res.send('test');
};