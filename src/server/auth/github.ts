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
        const { rows: userRows } = await query(
          `SELECT id, email, display_name, avatar_url FROM users WHERE github_id = $1`, [profile.id]
        );
        
        if (userRows && userRows.length > 0) {
          const user = userRows[0];
          const { rows: memberRows } = await query(
            `SELECT org_id FROM org_members WHERE user_id = $1 LIMIT 1`,
            [user.id]
          );
          const orgId = memberRows?.[0]?.org_id;
          const token = generateToken({ userId: user.id, orgId });
          return done(null, { user, token });
        }
        
        // Create new user
        const email = profile.emails?.[0]?.value || "";
        let newUser;
        try {
          const { rows: newUserRows } = await query(
            `INSERT INTO users (github_id, email, display_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, email, display_name, avatar_url`,
            [profile.id, email, profile.displayName, profile.photos?.[0]?.value]
          );
          if (!newUserRows || newUserRows.length === 0) {
            throw new Error("Failed to create user");
          }
          newUser = newUserRows[0];
        } catch (insertErr: any) {
          if ((insertErr as any)?.code === "23505") {
            return done(new Error("A user with this email address already exists. Please log in with your existing account or use a different GitHub account with a different email."));
          }
          throw insertErr;
        }
        
        // Create personal org for the user
        const orgName = `${profile.username}'s Workspace`;
        const rawSlug = (profile.username ?? `user-${profile.id}`)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 63);
        const orgSlug = rawSlug || `user-${profile.id}`;
        
        const { rows: orgRows } = await query(
          `INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING *`,
          [orgName, orgSlug]
        );
        
        if (!orgRows || orgRows.length === 0) {
          throw new Error("Failed to create organization");
        }
        const org = orgRows[0];
        
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
