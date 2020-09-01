const express = require('express');
const multer = require('multer');
const passport = require('passport');
const fs = require('fs-extra');
const standart_hd = 'ktun.edu.tr';
const config = require('./../bin/config');
const db = require('./../bin/db/database');
const router = express.Router();
const CryptoJS = require("crypto-js");


var upload = multer({ storage: multer.memoryStorage() })
const GoogleStrategy = require('passport-google-oauth20').Strategy;
let obj = {};

passport.serializeUser(function (user, done) {

    const array_splitted = user._json.email.split('@');
    if (array_splitted[1] === standart_hd && array_splitted[0].substring(0, 1) === 'f') {
        db.getUserByStudentNumber(user._json.email.substring(1, 10)).then(value => {
            if (value != 0) {
                done(null, user._json.email.substring(1, 10));
            }
            else {
                db.insertUser(user).then(result => {

                    if (result)
                        done(null, user._json.email.substring(1, 10));
                    else
                        done(null, null);

                });

            }
        })
    }
    else if (array_splitted[1] === standart_hd) {
        db.getUserByStudentNumber(user._json.email.split('@')[0]).then(value => {
            if (value != 0) {
                done(null, user._json.email.split('@')[0]);
            }
            else {
                db.insertAdmin(user).then(result => {

                    if (result)
                        done(null, user._json.email.split('@')[0]);
                    else
                        done(null, null);

                });

            }
        })
    }
    else done(null, { key: -1 });


});
passport.deserializeUser(function (id, done) {

    if (id.key !== -1) {
        db.getUserByStudentNumber(id).then(end => {

            done(null, end)
        });
    }
    else done(null, id);

});
passport.use(new GoogleStrategy({
    clientID: config.google_client_id,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL
},
    (at, rt, profile, done) => {

        process.nextTick(function () {
            return done(null, profile);
        });
    }

));
router.get('/google', passport.authenticate('google', {

    hd: 'ktun.edu.tr',
    prompt: 'select_account',
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));


router.get('/redirect', passport.authenticate('google', {
    successRedirect: '/auth/handle'
    , failureRedirect: '/'
}), (req, res) => {

    req.session.user = req.user;
});

router.get('/handle', async (req, res, next) => {

    if ('user' in req) {
        if (req.user.key === -1) {//zey
            req.logOut();
            req.user = null;
            req.session.destroy((err) => {

                delete req.user;
            });
            res.redirect('/auth/failure');
        }
        else {
            if (req.isAuthenticated()) {

                const array_info = req.user[0];
                const all_anno = await db.getAllAnno();
                const powers = await db.getUserPowers(array_info.email.split('@')[0]);
                const picture_state = array_info.picturestate;
                const array_splitted = array_info.email.split('@');
                const admins = await db.getAllAdmins();
                const period = await db.checkPeriod();
                const result_of = [];
                const users = await db.getAllUsers();
                powersArray = [];
                powers === 0 ? powersArray[0] = { level: 0 } : powersArray[0] = powers[0];
                for (let i = 0; i < users.length; i++) {
                    const array = await db.getLatestUserForm(users[i].studentnumber);
                    if (Array.from(array)[0] !== undefined)
                        result_of.push(Array.from(array).pop());
                }


                const CONTENT_STUDENT = {
                    title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Profil', name: array_info.namesurname,
                    email: array_info.email, studentNumber: array_info.studentnumber,
                    department: array_info.department, picturestate: picture_state, course: 'none',
                    page: 0, pw: powersArray[0], anno: all_anno, admins: admins, period: period, forms: result_of
                };
                const CONTENT_ACADE = {
                    title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Öğretim Görevlisi', name: array_info.namesurname,
                    email: array_info.email, studentNumber: array_info.studentnumber,
                    department: array_info.department, picturestate: picture_state, course: 'none',
                    page: 0, pw: powersArray[0], anno: all_anno, admins: admins, period: period, forms: result_of
                };


                if (array_splitted[1] === standart_hd) {

                    array_info.department !== -12 ? res.render('logged.ejs', CONTENT_STUDENT) : res.render('loggedadmin.ejs', CONTENT_ACADE)
                }
                else {

                    req.logOut();
                    req.user = null;
                    req.session.destroy((err) => {

                        delete req.user;
                    });
                    res.redirect('/auth/failure');

                }
            }
        }
    }
    else next();
});

router.get('/failure', (req, res, next) => {

    res.render('home.ejs', {
        title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Hata', error: 1
    });
})
router.get('/period/:op', async (req, res, next) => {


    if ('user' in req) {
        if (req.user.key === -1) {
            req.logOut();
            req.user = null;
            req.session.destroy((err) => {

                delete req.user;
            });
            res.redirect('/auth/failure');
        }
        else {
            if (req.params.op === "default") {
                const array_info = req.user[0];
                const all_anno = await db.getAllAnno();
                const powers = await db.getUserPowers(array_info.email.split('@')[0]);
                if (powers[0].level === 0 || powers[0].level === 1) return res.redirect('/auth/handle');
                const picture_state = array_info.picturestate;
                const array_splitted = array_info.email.split('@');
                const admins = await db.getAllAdmins();
                const period = await db.checkPeriod();
                powersArray = [];
                powers === 0 ? powersArray[0] = { level: 0 } : powersArray[0] = powers[0];
                const CONTENT_ACADE = {
                    title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Öğretim Görevlisi', name: array_info.namesurname,
                    email: array_info.email, studentNumber: array_info.studentnumber,
                    department: array_info.department, picturestate: picture_state, course: 'none',
                    page: 2, pw: powersArray[0], anno: all_anno, admins: admins, period: period
                };
                res.render('loggedadmin.ejs', CONTENT_ACADE);
            }
            else if (req.params.op === "start") {
                const array_info = req.user[0];
                const powers = await db.getUserPowers(array_info.email.split('@')[0]);

                if (powers[0].level === 0 || powers[0].level === 1) return res.redirect('/auth/handle');
                const result = db.insertPeriod(req.query.date);
                res.redirect('/auth/period/default');

            }
            else if (req.params.op === "finished") {
                const array_info = req.user[0];
                const powers = await db.getUserPowers(array_info.email.split('@')[0]);
                if (powers[0].level === 0 || powers[0].level === 1) return res.redirect('/auth/handle');
                const result = db.finishPeriod();
                res.redirect('/auth/period/default');
            }

        }

    } else next();
});

router.get('/trainee/:par', async (req, res, next) => {

    if ('user' in req) {
        if (req.user.key === -1) {
            req.logOut();
            req.user = null;
            req.session.destroy((err) => {

                delete req.user;
            });
            res.redirect('/auth/failure');
        }
        else {
            if (req.params.par === "default") {
                const array_info = req.user[0];
                const all_anno = await db.getAllAnno();
                const powers = await db.getUserPowers(array_info.email.split('@')[0]);
                if (powers[0].level === 0 || powers[0].level === 1) return res.redirect('/auth/handle');
                const picture_state = array_info.picturestate;
                const array_splitted = array_info.email.split('@');
                const admins = await db.getAllAdmins();
                const period = await db.checkPeriod();
                const users = await db.getAllUsers();
                const result_of = [];
                if (req.query.q !== undefined && req.query.q !== "" && "q" in req.query) {

                    const array = await db.getLatestUserForm(req.query.q);
                    if (Array.from(array)[0] !== undefined)
                        result_of.push(Array.from(array).pop());
                }
                else {
                    for (let i = 0; i < users.length; i++) {

                        const array = await db.getLatestUserForm(users[i].studentnumber);
                        if (Array.from(array)[0] !== undefined)
                            result_of.push(Array.from(array).pop());
                    }

                }
                powersArray = [];
                powers === 0 ? powersArray[0] = { level: 0 } : powersArray[0] = powers[0];
                const CONTENT_ACADE = {
                    title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Öğretim Görevlisi', name: array_info.namesurname,
                    email: array_info.email, studentNumber: array_info.studentnumber, department: array_info.department, picturestate: picture_state, course: 'none', page: 0, pw: powersArray[0], anno: all_anno, admins: admins, period: period,
                    forms: result_of
                };
                res.render('loggedadmin.ejs', CONTENT_ACADE);
            }
            else {
                console.log(req.params.par);
                res.redirect('/auth/handle');
            }

        }

    } else next();
});
router.get('/addadmin/:param', async (req, res, next) => {


    if ('user' in req) {
        if (req.user.key === -1) {
            req.logOut();
            req.user = null;
            req.session.destroy((err) => {

                delete req.user;
            });
            res.redirect('/auth/failure');
        }
        else {
            switch (req.params.param) {
                case 'list':
                    {
                        const array_info = req.user[0];
                        const all_anno = await db.getAllAnno();
                        const powers = await db.getUserPowers(array_info.email.split('@')[0]);
                        if (powers[0].level === 0 || powers[0].level === 1) return res.redirect('/auth/handle');
                        const picture_state = array_info.picturestate;
                        const array_splitted = array_info.email.split('@');
                        const admins = await db.getAllAdmins();
                        powersArray = [];
                        powers === 0 ? powersArray[0] = { level: 0 } : powersArray[0] = powers[0];

                        const CONTENT_ACADE = {
                            title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Öğretim Görevlisi', name: array_info.namesurname,
                            email: array_info.email, studentNumber: array_info.studentnumber, department: array_info.department, picturestate: picture_state, course: 'none', page: 1, pw: powersArray[0], anno: all_anno, admins: admins
                        };
                        res.render('loggedadmin.ejs', CONTENT_ACADE);
                        break;
                    }
                case 'delete':
                    {
                        const array_info = req.user[0];
                        const powers = await db.getUserPowers(array_info.email.split('@')[0]);
                        if (powers[0].level === 0 || powers[0].level === 1) return res.redirect('/auth/handle');
                        const result = db.setAdminLevels(req.query.id, "del");
                        res.redirect('/auth/addadmin/list');
                        break;
                    }
                case 'addmod':
                    {
                        const array_info = req.user[0];
                        const powers = await db.getUserPowers(array_info.email.split('@')[0]);
                        if (powers[0].level === 0 || powers[0].level === 1) return res.redirect('/auth/handle');
                        const result = db.setAdminLevels(req.query.id, "add");
                        res.redirect('/auth/addadmin/list');
                        break;
                    }
            }

        }

    } else next();

});

router.get('/editform', async (req, res, next) => {

    if ('user' in req) {
        if (req.user.key === -1) {
            req.logOut();
            req.user = null;
            req.session.destroy((err) => {

                delete req.user;
            });
            res.redirect('/auth/failure');
        }
        else {
            if (req.isAuthenticated()) {
                const result = await db.getLatestUserForm(req.user[0].studentnumber);
                const array_info = req.user[0];
                const picture_state = array_info.picturestate;
                const array_splitted = array_info.email.split('@');
                const period = await db.checkPeriod();

                const content = {
                    title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Profil', name: array_info.namesurname,
                    email: array_info.email, studentNumber: array_info.studentnumber, picturestate: picture_state, department: array_info.department, course: 'none', page: 2,
                    length: result.length, forms: result, period: period
                };

                if (array_splitted[1] === standart_hd) {

                    res.render('logged.ejs', content);

                }

            }
        }
    } else next();


});
router.get('/checktrainee', async (req, res, next) => {

    if ('user' in req) {
        if (req.user.key === -1) {
            req.logOut();
            req.user = null;
            req.session.destroy((err) => {

                delete req.user;
            });
            res.redirect('/auth/failure');
        }
        else {
            const array_info = req.user[0];
            const all_anno = await db.getAllAnno();
            const picture_state = array_info.picturestate;
            const admins = await db.getAllAdmins();
            const period = await db.checkPeriod();
            const form = await db.getLatestUserForm(array_info.studentnumber);
            const CONTENT_ST = {
                title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Öğrenci Staj Takip', name: array_info.namesurname,
                email: array_info.email, studentNumber: array_info.studentnumber, department: array_info.department, picturestate: picture_state, course: 'none', page: 3, anno: all_anno, admins: admins, period: period,
                forms: form[form.length - 1]
            };
            return res.render('logged.ejs', CONTENT_ST);
        }

    }
    else next();
});
router.get('/form', async (req, res, next) => {

    if ('user' in req) {
        if (req.user.key === -1) {
            req.logOut();
            req.user = null;
            req.session.destroy((err) => {

                delete req.user;
            });
            res.redirect('/auth/failure');
        }
        else {


            if (req.isAuthenticated()) {
                const result = await db.getLatestUserForm(req.user[0].studentnumber);
                if (result.length > 0 && !('update' in req.query))
                    return res.redirect('/auth/editform');
                const array_info = req.user[0];
                const picture_state = array_info.picturestate;
                const array_splitted = array_info.email.split('@');
                const period = await db.checkPeriod();
                let content = {};
                if (req.query.update === '1') {
                    const bytes = CryptoJS.AES.decrypt(result[result.length - 1].idno, config.secretCrypto);
                    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
                    content = {
                        title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Profil', name: array_info.namesurname,
                        email: array_info.email, studentNumber: array_info.studentnumber, picturestate: picture_state, department: array_info.department, course: 'none', page: 1, formBefore: result[result.length - 1], dcrypted: plaintext, period: period
                    };
                }
                else {

                    content = {
                        title_desc: 'Konya Teknik Üniversitesi - Staj Bilgilendirme Sistemi - Profil', name: array_info.namesurname,
                        email: array_info.email, studentNumber: array_info.studentnumber, picturestate: picture_state, department: array_info.department, course: 'none', page: 1, formBefore: null, period: period
                    };
                }


                if (array_splitted[1] === standart_hd) {

                    res.render('logged.ejs', content);

                }
                else {

                    req.logOut();
                    req.user = null;
                    req.session.destroy((err) => {

                        delete req.user;
                    });
                    res.redirect('/auth/failure');

                }
            }
            else res.redirect('/auth/failure')
        }
    } else res.redirect('/auth/failure');


})

router.post('/addimage', upload.single('avatar'), (req, res, next) => {

    if (req.user[0].picturestate === 0) {
        if (!fs.existsSync('./public/pictures/' + req.user[0].email.substring(1, 10))) {
            fs.mkdirSync('./public/pictures/' + req.user[0].email.substring(1, 10));
        }
        db.updateUserForm(`UPDATE users SET picturestate = 1 WHERE studentnumber = ${req.user[0].studentnumber}`).then(res => {
        });
        fs.writeFile('./public/pictures/' + req.user[0].email.substring(1, 10) + "/" + "profile.png", req.file.buffer).then
            (err => {


                res.send('Uploaded.');
            });
    }


});

router.post("/inform", async (req, res, next) => {

    if (req.isAuthenticated()) {

        const DATE = config.dateTime().toString();
        const hashed = CryptoJS.AES.encrypt(req.body.idcardno, config.secretCrypto);
        const stringQuery = `INSERT INTO forms(studentnumber, idno, namesurname, course, email, phonenumber, traineedays, traineeperiod, companyname, city, traineeform, healthform, idcardphoto, unemployedform, healthincury, pricefromcompany, traineecompname, personals, taxno, bankname, companyiban, address, type, date) 
        VALUES('${req.user[0].studentnumber}', '${hashed}', 
        '${req.user[0].namesurname}','${req.user[0].department}', 
        '${req.user[0].email}', '${req.body.number}', '${req.body.traineedays}', 
        '${req.body.traineeperiod}', '${req.body.companyname[0]}', 
        '${req.body.city}', '${req.body.traineeform}', '${req.body.healthform}', 
        '${req.body.idcardphoto}', '${req.body.unemployedform}', 
        '${req.body.ghi}', '1', '${req.body.companyname[0]}', 
        '${req.body.companypersonals}', '${req.body.taxno}', '${req.body.bankname}', 
        '${req.body.ibanno}', '${req.body.address}', '${req.body.companytype}', 
        '${DATE}')`;
        db.insertUserForm(stringQuery);
        res.send("/auth/editform");
    }

})
router.get('/logout', (req, res, next) => {

    req.logOut();
    req.user = null;
    req.session.destroy((err) => {

        console.log(err);
        delete req.user;
    });


})

module.exports = router;
