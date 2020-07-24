const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');

const mysqlDB = require('./mysql_config');
const db = mysqlDB();


passport.use(new LocalStrategy(
   { usernameField: 'email' },
   async (username, password, done) => {
      try {
         const user = (await db.query(`select * from users where email = '${username}'`))[0];
         if (!user) { return done(null, false); }
         if (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result) return done(null, user);
         }
         return done(null, false);
      } catch (error) {
         return done(error)
      }
   }
));

const opts = {
   jwtFromRequest: ExtractJwt.fromHeader('authorization'),
   secretOrKey: process.env.TOKEN_KEY
}
passport.use(new JwtStrategy(opts,
   async (payload, done) => {
      try {
         const { insertId } = (await db.query(`select * from users where id = '${payload.id}'`))[0]
         const user = (await db.query(`select * from users where id =${insertId}`))[0];
         if (user) {
            return done(null, user);
         } else {
            return done(null, false);
         }
      } catch (error) {
         return done(error);
      }
   }));

passport.use(new GoogleStrategy({
   clientID: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   callbackURL: "/users/auth/google/redirect"
},
   async (accessToken, refreshToken, profile, done) => {
      const { sub: id, email } = profile._json;

      const userQuery = `select * from users where
                     google_id = '${id}' || 
                     email = '${email}' || 
                     google_email = '${email}' || 
                     facebook_email = '${email}'
                     `;
      try {
         let user = (await db.query(userQuery))[0];
         // id null & email null
         if (!user) {
            const { insertId } = (await db.query(`insert into users (google_id, google_email) values ('${id}', '${email}')`));
            user = (await db.query(`select * from users where id =${insertId}`))[0];
            return done(null, user);
         }
         // id null & email
         if (user && !user.google_id) {
            const result = (await db.query(`
                  UPDATE  users SET 
                  google_id = '${id}', 
                  google_email = '${email}' WHERE 
                  email = '${email}'|| 
                  google_email = '${email}' || 
                  facebook_email = '${email}'`
            ));
            user = (await db.query(`select * from users where id =${user.id}`))[0];
            return done(null, user);
         }
         return done(null, user);
      } catch (error) {
         return done(error)
      }
   }
));

passport.use(new FacebookStrategy({
   clientID: process.env.FACEBOOK_APP_ID,
   clientSecret: process.env.FACEBOOK_APP_SECRET,
   callbackURL: "/users/auth/facebook/redirect",
   profileFields: ['id', 'displayName', 'email']
},
   async (accessToken, refreshToken, profile, done) => {
      const { id, email } = profile._json;

      const userQuery = `select * from users where
                     facebook_id = '${id}' || 
                     email = '${email}' || 
                     google_email = '${email}' || 
                     facebook_email = '${email}'
                     `;
      try {
         let user = (await db.query(userQuery))[0];
         // id null & email null
         if (!user) {
            const { insertId } = (await db.query(`insert into users (facebook_id, facebook_email) values ('${id}', '${email}')`));
            user = (await db.query(`select * from users where id =${insertId}`))[0];
            return done(null, user);
         }
         // id null & email
         if (user && !user.facebook_id) {
            const result = (await db.query(`
                  UPDATE  users SET 
                  facebook_id = '${id}', 
                  facebook_email = '${email}' WHERE 
                  email = '${email}'|| 
                  google_email = '${email}' || 
                  facebook_email = '${email}'`
            ));
            user = (await db.query(`select * from users where id =${user.id}`))[0];
            return done(null, user);
         }
         return done(null, user);
      } catch (error) {
         return done(error)
      }
   }
));


const oauthMethod = async (method, profile, done) => {
   const { sub, email } = profile._json;
   const id = sub ? sub : profile._json.id;
   const methodID = `${method}_id`;

   const quary = `select * from users where
         ${method}_id = '${id}' || email = '${email}' || google_email = '${email}' || facebook_email = '${email}'`;
   try {
      let user = (await db.query(quary))[0];
      console.log(user)
      // id null & email null
      if (!user) {
         const { insertId } = (await db.query(`insert into users (${method}_id, ${method}_email) values ('${id}', '${email}')`));
         user = (await db.query(`select * from users where id =${insertId}`))[0];
         return done(null, user);
      }
      // id null & email
      if (user && !user[methodID]) {
         console.log('id null')
         const result = (await db.query(`UPDATE  users SET ${method}_id = '${id}', ${method}_email = '${email}' WHERE 
                  email = '${email}'|| google_email = '${email}' || facebook_email = '${email}'`
         ));
         user = (await db.query(`select * from users where id =${user.id}`))[0];
         return done(null, user);
      }
      return done(null, user);
   } catch (error) {
      return done(error)
   }
}