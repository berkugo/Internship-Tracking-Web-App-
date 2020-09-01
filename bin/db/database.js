const mysql = require('mysql');


const con = mysql.createConnection({
    host: "localhost",
    user: "zalina",
    database: 'ktun_trainee',
    password: "123"
});
function makeQuery(queryString) {
    return new Promise((resolve, reject) => {
        con.query(queryString, (err, result, fields) => {

            if (result !== undefined) {
                if (result.length > 0) {
                    resolve(result)

                }
                else {
                    resolve(0);

                }
            }
            else reject(0);


        });
    });
}
function makeInsertQuery(queryString) {
    return new Promise((resolve, reject) => {
        con.query(queryString, (err, result, fields) => {
            if (result !== undefined)
                if (result.affectedRows > 0)
                    resolve(true);
                else resolve(false);
            else reject(false);
        });
    });
}

module.exports =
    {
        updateUserForm: async info => {
            try {
                const result = await makeInsertQuery(info);
                return result;
            }
            catch (err) {
                return err;
            }
        },
        getUserPowers: async uname => {
            try {
                const result = await makeQuery(`SELECT * FROM admins WHERE uname='${uname}'`);
                return result;
            }
            catch (err) {

                return err;
            }
        },
        insertUserForm: queryString => {
            try {
                makeInsertQuery(queryString).then(result => {
                    return result;
                });
            }
            catch (err) {
                return err;
            }

        },
        insertUser: async info => {
            try {

                const result = await makeInsertQuery(`INSERT INTO users(studentnumber, namesurname, email, picturestate, department) VALUES("${info._json.email.substring(1, 10)}", "${info._json.name}", "${info._json.email}", 0, "${info._json.email.substring(5, 7)}")`);
                return result;
            }
            catch (err) {
                return err;
            }


        },
        insertAdmin: async info => {
            try {
                const NP = await makeInsertQuery(`INSERT INTO admins(uname, level, pname, dept) VALUES("${info._json.email.split('@')[0]}", 0, "${info._json.name}", -12)`);
                const result = await makeInsertQuery(`INSERT INTO users(studentnumber, namesurname, email, picturestate, department) VALUES("${info._json.email.split('@')[0]}", "${info._json.name}", "${info._json.email}", 0, "-12")`);
                return result;
            }
            catch (err) {
                return err;
            }


        },
        getLatestUserForm: async id => {

            try {
                const result = await makeQuery(`SELECT * FROM forms WHERE studentnumber='${id}'`);
                return result;
            }
            catch (err) {

                return err;
            }
        },
        getUserByStudentNumber: async (number) => {
            try {
                const result = await makeQuery(`SELECT * FROM users WHERE studentnumber="${number}"`);
                return result;
            }
            catch (err) {

                return err;
            }
        },
        getAllUsers: async () => {
            try {
                const result = await makeQuery("SELECT * FROM users");
                return result;
            }
            catch (err) {
                return err;
            }
        },
        getAllAnno: () => {
            return makeQuery(`SELECT * FROM anno`);
        },
        getAllAdmins: () => {
            return makeQuery('SELECT * FROM admins');
        },
        checkPeriod: () => {

            const result = makeQuery("SELECT * FROM periods WHERE state = 1");
            return result;

        },
        insertPeriod: async (date) => {

            const date_splitting = date.split("/");
            console.log(date_splitting);
            const period_date = date_splitting[2].toString() + ' - ' + (parseInt(date_splitting[2]) + 1).toString();
            const result = await makeInsertQuery(`INSERT INTO periods (bgdate, applicationcount, state, period) VALUES ('${date}', 0, 1, '${period_date}')`);
            return result;
        },
        finishPeriod: async () => {
            const result = await makeQuery("UPDATE periods SET state = 0 WHERE state = 1");
            return result;
        },
        setAdminLevels: async (id, level) => {

            try {
                if (level === "del") {

                    const result = await makeQuery(`UPDATE admins SET level = 0 WHERE uname = '${id}'`);
                    return result;
                } else if (level === "add") {
                    const result = await makeQuery(`UPDATE admins SET level = 1 WHERE uname = '${id}'`);

                    return result;
                }

            }
            catch (error) {
                return error;
            }

        }
    }
