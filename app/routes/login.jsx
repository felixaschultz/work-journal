import { Form, useLoaderData, Link, useActionData} from "@remix-run/react";
import { commitSession, getSession } from "~/services/session";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { redirect } from "@remix-run/node";

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

export async function action({ request }) {
    let formData = await request.formData();
    let { email, password } = Object.fromEntries(formData);
    /* const mail = request.body.get("mail"); */
    /* const password = request.body.get("password"); */
    const user = await mongoose.models.User.findOne({ email }).select("+password");
    /* const isPasswordValid = await bcrypt.compare(password, user.password); */
    user.password = undefined;

    if(user){
        let session = await getSession();
        session.set("isAdmin", true);
        await commitSession(session);
        return new Response("", {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
    }else{
        return "Unauthorized";
    }
}