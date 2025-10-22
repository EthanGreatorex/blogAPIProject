// ----IMPORTS----
import passport from "passport";
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import {prisma} from './prismaClient'; 

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('Missing JWT_SECRET environment variable');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
}

passport.use(
    new JwtStrategy(options, async(jtw_payload, done) => {
        try{
            const user = await prisma.user.findUnique({where: {id: jtw_payload.id}})
            if (user) return done(null, user);
            return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    })
);

export default passport