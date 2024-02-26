import { Form, useActionData} from "@remix-run/react";
import { commitSession, getSession } from "~/services/session";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { redirect, json } from "@remix-run/node";

export default function Login(){
    const actionData = useActionData();
    return (
        <>
            <div className="grid place-content-center place-items-center h-screen p-8 text-slate-50 bg-slate-900">
                <section className="w-full m-auto mt-10">
                    <h2 className="text-2xl">Login</h2>
                    <Form method="post">
                        <div className="my-5">
                            <label className="block" htmlFor="mail">Mail</label>
                            <input className="w-full text-slate-500 p-2" type="text" id="mail" name="mail" required />
                        </div>
                        <div>
                            <label className="block" htmlFor="password">Password</label>
                            <input className="w-full text-slate-500 p-2" type="password" id="password" name="password" required />
                        </div>
                        <button className="rounded-md w-full bg-slate-500 p-2 mt-2 disabled:bg-slate-50 items-end" type="submit">Login</button>
                        {actionData === "Bad credentials" && (
                            <p className="mt-4 font-medium text-red-500">Invalid login.</p>
                        )}
                    </Form>
                </section>
            </div>
        </>
    )
}

export async function action({ request }) {
    const formData = await request.formData();
    const mail = formData.get("mail");
    const password = formData.get("password");

    const user = await mongoose.models.User.findOne({ mail }).select("+password");
    let error;
    if(!user){
        error = "Bad credentials";
    }
    const isPasswordValid = await bcrypt.compare(password, user?.password);
    user.password = undefined;

    if(!isPasswordValid){
        error = "Bad credentials";
    }else{
        error = null;
    }

    if(user && !error && isPasswordValid){
        let session = await getSession();
        session.set("isAdmin", true);
        await commitSession(session);

        return redirect("/", {
            headers: {
              "Set-Cookie": await commitSession(session)
            },
        });
    }else{
        return json({ error: error }, 401);
    }
}