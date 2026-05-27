import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { generateToken } from "./jwt.ts";
import { query } from "../db/pool.ts";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables are required");
}

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/v1/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const { rows: [user] } = await query(
          `SELECT * FROM users WHERE github_id = $1`, [profile.id]
        );
        
        if (user) {
          // User exists, generate token
          const token = generateToken({ userId: user.id });
          return done(null, { user, token });
        }
        
        // Create new user
        const { rows: [newUser] } = await query(
          `INSERT INTO users (github_id, email, display_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`,
          [profile.id, profile.emails?.[0]?.value || "", profile.displayName, profile.photos?.[0]?.value]
        );
        
        // Create personal org for the user
        const orgName = `${profile.username}'s Workspace`;
        const orgSlug = profile.username;
        
        const { rows: [org] } = await query(
          `INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING *`,
          [orgName, orgSlug]
        );
        
        await query(
          `INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, $3)`,
          [org.id, newUser.id, "admin"]
        );
        
        const token = generateToken({ userId: newUser.id, orgId: org.id });
        return done(null, { user: newUser, token });
      } catch (err) {
        console.error("GitHub authentication error:", err);
        return done(err);
      }
    }
  )
);

export const githubAuth = passport.authenticate("github", { session: false });

export const githubCallback = passport.authenticate("github", {
  session: false,
  failureRedirect: "/login",
});

// Function to setup GitHub strategy (called during server initialization)
export const setupGitHubStrategy = () => {
  // The strategy is already set up above when the module is loaded
  // This function exists for compatibility with the server import
  return passport;
};
