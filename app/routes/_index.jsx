import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useFetcher } from "@remix-run/react";
import { startOfWeek, format } from 'date-fns';
import { getSession } from "~/services/session";
import { useRef, useEffect } from "react";
import EntryForm from "~/components/EntryForm";

export async function loader({ request }) {
  const user = await getSession(request.headers.get("Cookie"));

  const entries = await mongoose.models.Entry.find().sort({ date: -1 });
  const entriesByWeek = entries.reduce((acc, entry) => {
    const weekStart = format(startOfWeek(new Date(entry.date), {weekStartsOn: 1}), 'dd MMM yyyy');
    const type = entry.type;

    if (!acc[weekStart]) {
      acc[weekStart] = {};
    }
    acc[weekStart][type] = acc[weekStart][type] || [];
    acc[weekStart][type].push(entry);

    return acc;
  }, {});
  return json({ entriesByWeek, session: user.data });
}

export default function Index() {
  const { entriesByWeek, session } = useLoaderData();
  const fetcher = useFetcher();
  let textRef = useRef();

  useEffect(() => {
    if (fetcher.state === "submitting" && textRef.current) {
      textRef.current.value = "";
      textRef.current.focus();
    }
  }, [fetcher.state]);

  return (
    <div className="p-8 text-slate-50">
      {session.isAdmin && 
        <EntryForm />
      }
      <section className="w-1/2 m-auto mt-10">
      {Object.entries(entriesByWeek).map(([weekStart, entries]) => (
        <div key={weekStart} className="p-6 mb-3 bg-slate-300 text-slate-700 text-slate-100 rounded-md">
          <h2 className="text-lg">Week of {weekStart}</h2>
          {
            Object.entries(entries).map(([type, entries]) => (
              <EntryItem key={type} entry={entries} type={type} session={session} />
            ))
          }
        </div>
      ))}
      </section>
    </div>
  );
}

export const action = async ({ request }) => {
  let session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
        status: 401,
        statusText: "Not authenticated",
    });
  }
  const formData = await request.formData();
  const { date, type, text } = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Save to MongoDB
  return await mongoose.models.Entry.create({ date, type, text });
};

function EntryItem({ entry, type, session }) {
  return (
    <div className="mt-3">
      <h3 className="text-base font-bold">{type}</h3>
      <ul className="pl-5 list-inside">
        {entry.map((entry) => (
          <>
            <li key={entry._id} className="text-sm group">
              {entry.text}
              {session.isAdmin && <Link to={`/entries/${entry._id}/edit`} className="text-slate-500 p-2 opacity-0 group-hover:opacity-70">Edit</Link>}
            </li>
          </>

        ))}
      </ul>
    </div>
  );
}