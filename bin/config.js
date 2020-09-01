/**
 * Server config.
 */

const config = {
    google_client_id: '1013679886469-n7ijmi9as6thama0s3cpt21495vb25ok.apps.googleusercontent.com',
    clientSecret: 'P87ZHTfPLgpthso82-iEgIyq',
    secretCrypto: 'ktnstj',
    callbackURL: "http://localhost:3000/auth/redirect",
    dateTime: () => {

        let date = new Date();

        let hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        let min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        let sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        let year = date.getFullYear();

        let month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;

        let day = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        return day + "/" + month + "/" + year + " - " + hour + ":" + min + ":" + sec;

    },
    lastDate: () => {
        let date = new Date();

        let hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        let min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        let sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        let year = date.getFullYear();

        let month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;

        let day = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        return day + "/" + month + "/" + year;
    }
};


module.exports = config;