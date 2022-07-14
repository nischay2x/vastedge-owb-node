const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const keys = require("./keys");
const query = require("../data-access/login");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.SECRETORKEY;
opts.passReqToCallback = true;

module.exports = passport => {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // passport.deserializeUser(function(id, done) {
  //   User.findById(id, function(err, user) {
  //     done(err, user);
  //   });
  // });

  passport.use(
    new JwtStrategy(opts, (req, jwt_payload, done) => {
      query.findUserById(jwt_payload.id).then(user => {
        if (!user) {
          return done(null, false);
        }

        delete user.password;
        return done(null, user);
      })
        .catch(error => {
          return done(null, false);
        });
    })
  );


};
