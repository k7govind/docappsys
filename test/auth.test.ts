import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/user.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/docappsys-test";

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe("Auth flow", () => {
  const email = `test+${Date.now()}@example.com`;
  const password = "Password123!";

  it("registers a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password })
      .expect(201);

    expect(res.body.id).toBeDefined();
  });

  let accessToken: string;

  it("logs in and receives access token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it("accesses protected endpoint with access token", async () => {
    // Create a simple protected endpoint for test if not present
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.user).toBeDefined();
  });
});