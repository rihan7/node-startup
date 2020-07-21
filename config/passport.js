const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../model/user');

passport.use(new LocalStrategy(
   { usernameField: 'email' },
   async (username, password, done) => {
      try {
         const user = await User.findOne({ email: username }).exec();
         if (!user) { return done(null, false); }
         if (! await user.verifyPassword(password)) { return done(null, false); }
         return done(null, user);
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
         const user = await User.findById(payload.id).exec();
         if (user) {
            return done(null, user);
         } else {
            return done(null, false);
         }
      } catch (error) {
         return done(error);
      }
   })
);