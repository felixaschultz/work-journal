import { authenticator } from "~/services/auth.server";
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { sessionStorage } from "~/services/session.server";

export async function loader({ request }) {
    await authenticator.isAuthenticated(request, {
        successRedirect: "/",
    });

    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    // Get the error message from the session
    const error = session.get("sessionErrorKey");
    return json({ error }); // return the error message
}

export default function Login(){
    return (
        <>
            <h1>Login</h1>
            <Form method="post">
                <div>
                    <label htmlFor="mail">Mail</label>
                    <input type="text" id="mail" name="mail" required />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Login</button>
            </Form>
        </>
    )
}

export function action({request}){
    return authenticator.authenticate("user-pass", request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
}