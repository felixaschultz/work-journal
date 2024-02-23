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
import { getSession } from "~/services/session";
import { useLoaderData } from "@remix-run/react";

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
        <header className="grid grid-cols-2 p-4">
          <h1 className="text-3xl text-slate-50 font-bold">Weekly Journal</h1>
          {
            !session.isAdmin && 
            <Link to="/login" className="block min-w-max ml-auto w-fit py-2 px-11 text-slate-100 bg-slate-500 rounded-md">Login</Link>
          }
          {
            session.isAdmin && 
            <Link to="/logout" className="block min-w-max ml-auto w-fit py-2 px-11 text-slate-100 bg-slate-500 rounded-md">Logout</Link>
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
