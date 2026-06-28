import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import prisma from "../db";

export const authController = new Elysia({ prefix: "/auth" })
  // Register JWT plugin
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super_secret_key_change_me_in_production",
    })
  )
  
  // SIGNUP Route
  .post("/signup", async ({ body, jwt, error }) => {
    const { email, password } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return error(400, { message: "User already exists with this email" });
    }

    // Hash password using Bun's native secure password hashing
    const hashedPassword = await Bun.password.hash(password);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = await jwt.sign({
      sub: String(newUser.id),
      email: newUser.email,
    });

    return {
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    })
  })

  // SIGNIN Route
  .post("/signin", async ({ body, jwt, error }) => {
    const { email, password } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return error(401, { message: "Invalid email or password" });
    }

    // Verify password using Bun's native verification
    const isPasswordCorrect = await Bun.password.verify(password, user.password);

    if (!isPasswordCorrect) {
      return error(401, { message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = await jwt.sign({
      sub: String(user.id),
      email: user.email,
    });

    return {
      success: true,
      message: "Signin successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  })

  // GOOGLE Route
  .post("/google", async ({ body, jwt, error }) => {
    const { credential } = body;

    try {
      const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
      const response = await fetch(tokenInfoUrl);

      if (!response.ok) {
        return error(400, { message: "Invalid Google credential token" });
      }

      const payload: any = await response.json();
      const email = payload.email;

      if (!email) {
        return error(400, { message: "Google account does not have an email address" });
      }

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const randomPass = await Bun.password.hash(Math.random().toString(36) + "google-auth");
        user = await prisma.user.create({
          data: {
            email,
            password: randomPass,
          },
        });
      }

      const token = await jwt.sign({
        sub: String(user.id),
        email: user.email,
      });

      return {
        success: true,
        message: "Google authentication successful",
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (err: any) {
      return error(500, { message: err.message || "Failed to authenticate with Google" });
    }
  }, {
    body: t.Object({
      credential: t.String(),
    })
  });
