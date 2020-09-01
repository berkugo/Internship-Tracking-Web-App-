var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home.ejs', {
    title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Anasayfa', error: 0
  });
});

module.exports = router;
