const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('../model/user');


passport.use(new LocalStrategy(
   { usernameField: 'email' },
   async (username, password, done) => {
      try {
         const user = await User.findOne({ "local.email": username }).exec();
         if (!user) { return done(null, false); }
         if (!user.verifyPassword(password)) { return done(null, false); }
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
   }));

passport.use(new GoogleStrategy({
   clientID: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   callbackURL: "/users/auth/google/redirect"
},
   (accessToken, refreshToken, profile, done) => {
      return oauthMethod('google', profile, done)
   }
));

passport.use(new FacebookStrategy({
   clientID: process.env.FACEBOOK_APP_ID,
   clientSecret: process.env.FACEBOOK_APP_SECRET,
   callbackURL: "/users/auth/facebook/redirect",
   profileFields: ['id', 'displayName', 'email']
},
   (accessToken, refreshToken, profile, done) => {
      return oauthMethod('facebook', profile, done);
   }
));


const oauthMethod = async (method, profile, done) => {
   const { sub, email } = profile._json;
   const id = sub ? sub : profile._json.id;
   const methodID = `${method}.id`;
   try {
      let user = await User.findOne({
         $or: [
            { [methodID]: id },
            { 'local.email': email },
            { 'google.email': email },
            { 'facebook.email': email },
         ]
      });
      // id null & email null
      if (!user) {
         const newUser = new User({
            method: [method],
            [method]: {
               email: email,
               id: id
            }
         });
         user = await newUser.save();
         return done(null, user);
      }
      // id null & email
      if (user && !user[method].id) {
         user.method.push(method);
         user[method] = {
            email: email,
            id: id
         }
         await user.save();
         return done(null, user);
      }

      return done(null, user);
   } catch (error) {
      return done(error)
   }
}