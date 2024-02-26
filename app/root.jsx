import {
  Links,
  Link,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { getSession, destroySession } from "~/services/session";
import { useLoaderData } from "@remix-run/react";
import { Form, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { redirect } from "@remix-run/node";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function meta() {
  return [{ title: "Work Journal" }];
}

export async function loader({ request }) {
  const user = await getSession(request.headers.get("Cookie"));
  return { session: user.data };
}

export default function App() {
  const { session } = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-900">
        <header className="lg:w-1/2 sm:w-full grid grid-cols-2 p-4 m-auto">
          <h1 className="text-3xl text-slate-50 font-bold">Weekly Journal</h1>
          {
            !session.isAdmin && 
            <Link to="/login" className="block min-w-max ml-auto w-fit py-2 px-11 text-slate-100 bg-slate-500 rounded-md">Login</Link>
          }
          {
            session.isAdmin && 
            <Form method="post">
              <button className="block min-w-max ml-auto w-fit py-2 px-11 text-slate-100 bg-slate-500 rounded-md">Logout</button>
            </Form>
          }
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export async function action({ request }) {
  let session = await getSession(request.headers.get("cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export function ErrorBoundary() {
  let error = useRouteError();
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col items-center justify-center">
        <p className="text-3xl">Whoops!</p>
        {isRouteErrorResponse(error) ? (
          <p>
            {error.status} – {error.statusText}
          </p>
        ) : error instanceof Error ? (
          <p>{error.message}</p>
        ) : (
          <p>Something happened.</p>
        )}
        <Scripts />
      </body>
    </html>
  );
}