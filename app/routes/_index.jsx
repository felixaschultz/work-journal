import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useFetcher } from "@remix-run/react";
import { startOfWeek, format } from 'date-fns';
import { getSession } from "~/services/session";
import { useRef, useEffect } from "react";

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
      <fieldset
          className="disabled:opacity-70"
          disabled={fetcher.state === "submitting"}
        >
        <fetcher.Form method="post" className="w-1/2 m-auto rounded-md border-solid border-2 border-slate-500 border-ra p-4 mt-4">
          <div className="pt-2 pb-2">
            <label className="block text-slate-500" htmlFor="date">Date</label>
            <input className="text-slate-500 p-2" defaultValue={format(new Date(), 'yyyy-MM-dd')} type="date" id="date" name="date" required />
          </div>
          <span className="">
            <input defaultChecked type="radio" name="type" value="work" id="work" required /> <label className="text-slate-500" htmlFor="work">Work</label>
          </span>
          <span className="ml-5">
            <input type="radio" name="type" value="learning" id="learning" required /> <label className="text-slate-500" htmlFor="learning">Learning</label>
          </span>
          <span className="ml-5">
            <input type="radio" name="type" value="interesting-thing" id="interesting" required /> <label className="text-slate-500" htmlFor="interesting">Interesting Thing</label>
          </span>
          <div className="pt-3 pb-2 col-span-3">
            <label className="block text-slate-500" htmlFor="text">Text</label>
            <textarea ref={textRef} className="w-full p-1 h-20 text-slate-400" id="text" name="text" required />
          </div>
          <button className="rounded-md w-full bg-slate-500 p-2 disabled:bg-slate-50 items-end" type="submit" disabled={fetcher.state === "submitting"}>
            {fetcher.state === "submitting" ? "Saving..." : "Save"}
          </button>
        </fetcher.Form>
      </fieldset>
      }
      <section className="w-1/2 m-auto mt-10">
      {Object.entries(entriesByWeek).map(([weekStart, entries]) => (
        <div key={weekStart} className="p-6 mb-3 bg-slate-300 text-slate-700 text-slate-100 rounded-md">
          <h2 className="text-lg">Week of {weekStart}</h2>
          {
            Object.entries(entries).map(([type, entries]) => (
              <div key={type} className="mt-3">
                <h3 className="text-base font-bold">{type}</h3>
                <ul className="pl-5 list-disc list-inside">
                  {entries.map((entry) => (
                    <>
                      <li key={entry._id} className="text-sm">{entry.text}</li>
                      {session.isAdmin && <Link to={`/entries/${entry._id}/edit`} className="text-slate-500 p-2">Edit</Link>}
                    </>

                  ))}
                </ul>
              </div>
            ))
          }
        </div>
      ))}
      </section>
    </div>
  );
}

export const action = async ({ request }) => {
  const formData = await request.formData();
  const { date, type, text } = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Save to MongoDB
  return await mongoose.models.Entry.create({ date, type, text });
};
