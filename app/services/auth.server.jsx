import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export let authenticator = new Authenticator(sessionStorage, {
    sessionErrorKey: "sessionErrorKey" // keep in sync
});

async function verifyUser({ mail, password }) {
    // ...
    const user = await mongoose.models.User.findOne({ mail }).select("+password");
    if (!user) {
      throw new AuthorizationError("No user found with this email");
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid || password == null || password === "" || password === undefined) {
      throw new AuthorizationError("Invalid password");
    }
    /* user.password = undefined; */
    return user;
}

authenticator.use(
    new FormStrategy(async ({ form }) => {
      let mail = form.get("mail");
      let password = form.get("password");
      let user = null;
  
      if (!mail || mail?.length === 0) {
        throw new AuthorizationError("Bad Credentials: Email is required");
      }
      if (typeof mail !== "string") {
        throw new AuthorizationError("Bad Credentials: Email must be a string");
      }
  
      if (!password || password?.length === 0) {
        throw new AuthorizationError("Bad Credentials: Password is required");
      }
      if (typeof password !== "string") {
        throw new AuthorizationError("Bad Credentials: Password must be a string");
      }
      const verifedUser = await verifyUser({mail, password});
      if(verifedUser){
        return verifedUser;
      }
      return verifedUser;
    }),
    "user-pass"
);