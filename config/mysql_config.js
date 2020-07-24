const util = require('util');
const mysql = require('mysql');


const dbSetting = {
   host: 'localhost',
   user: 'root',
   password: process.env.DATABASE_PASSWORD,
   database: 'contacts_db'
};

const makeDB = () => {
   const connection = mysql.createConnection(dbSetting);
   return {
      query(sql, args) {
         return util.promisify(connection.query)
            .call(connection, sql, args);
      },
      close() {
         return util.promisify(connection.end).call(connection);
      }
   };
}

module.exports = makeDB;


