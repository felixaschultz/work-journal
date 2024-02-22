import { authenticator } from "~/services/auth.server";
import { Form, useLoaderData, Link } from "@remix-run/react";
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
            <div className="grid place-content-center place-items-center p-8 text-slate-50 bg-slate-900 h-full">
                <header className="grid grid-cols-2">
                    <h1 className="text-3xl font-bold">Weekly Journal</h1>
                </header>
                <section className="m-auto">
                    <h2 className="text-2xl">Login</h2>
                    <Form className="mt-10" method="post">
                        <div>
                            <label className="block" htmlFor="mail">Mail</label>
                            <input className="w-full text-slate-500 p-2" type="text" id="mail" name="mail" required />
                        </div>
                        <div>
                            <label className="block" htmlFor="password">Password</label>
                            <input className="w-full text-slate-500 p-2" type="password" id="password" name="password" required />
                        </div>
                        <button className="rounded-md w-full bg-slate-500 p-2 mt-2 disabled:bg-slate-50 items-end" type="submit">Login</button>
                    </Form>
                </section>
            </div>
        </>
    )
}

export function action({request}){
    return authenticator.authenticate("user-pass", request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
}