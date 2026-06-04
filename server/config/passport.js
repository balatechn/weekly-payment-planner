const passport = require('passport');
// Azure AD OAuth is optional - disabled for standard deployment
// Uncomment and install 'passport-azure-ad-oauth2' if you need Azure AD SSO
// const { Strategy: AzureAdOAuthStrategy } = require('passport-azure-ad-oauth2');
const jwt = require('jsonwebtoken');

// Azure AD OAuth Strategy (disabled by default)
// Uncomment this section if you need Azure AD Single Sign-On
/*
passport.use(
  new AzureAdOAuthStrategy(
    {
      clientID: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI,
      tenant: process.env.AZURE_TENANT_ID
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        // Decode the ID token to get user information
        const decodedToken = jwt.decode(params.id_token);
        
        const userProfile = {
          email: decodedToken.email || decodedToken.upn,
          name: decodedToken.name,
          id: decodedToken.oid
        };

        return done(null, userProfile);
      } catch (error) {
        return done(error);
      }
    }
  )
);
*/

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
