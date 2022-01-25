var passport = require('passport');
var localStrategy = require('passport-local').Strategy
var User = require('./models/user')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt
var jwt = require('jsonwebtoken')
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');
const { NotExtended } = require('http-errors');

exports.local = passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

exports.getToken= function (user){
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600 }
    )
}

var opts= {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
        (jwt_payload,done)=>{
            console.log('JWT_Payload: '+jwt_payload);
            User.findOne({_id : jwt_payload._id},(err,user)=>{
                if(err){
                    return done(err,false);
                }
                else if(user){
                    return done(null,user)
                }
                else{
                    return done(null,false)
                }
            })
        }
    ))

exports.verifyUser = passport.authenticate('jwt',{session:false})
exports.verifyAdmin = (req,res,next)=>{
    if(!req.user.admin){
        var err = new Error('You are not authorized to perform this operation!')
        err.status = 403
        return next(err)
    }
    return next()
}

exports.facebookPassport = passport.use(new
FacebookTokenStrategy (
    {
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
    },(accessToken , refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else{
                user = new User({
                    username: profile.displayName
                });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err) {
                        return done(err, false);
                    }
                    else {
                        return done(null, user);
                    }
                })
            }
        })
}));

// https://localhost:3443/users/facebook/token?access_token=EAAEuV7kQeRQBAGlKbvyGqm6mabfDFGkK7TbZCvKEK44A9utAUMdUDgueqm74FC67yA5dxVGjb2ZCYS1mjcM5WwrGTDa93YWa0XNRyJQYtKIiOD4xloTsvZBMbksUj9u3cpJVE5TzAdzdyvnhbpQYZADyV4nyP08bDSWga9pkqI0WDUrwk82AOIJhS92tISMZD