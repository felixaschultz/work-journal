import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useFetcher } from "@remix-run/react";
import { startOfWeek, format } from 'date-fns';

export async function loader() {
  const entries = await mongoose.models.Entry.find().sort({ date: -1 });
  const entriesByWeek = entries.reduce((acc, entry) => {
    const weekStart = format(startOfWeek(new Date(entry.date)), 'yyyy-MM-dd');
    if (!acc[weekStart]) {
      acc[weekStart] = [];
    }
    acc[weekStart].push(entry);
    return acc;
  }, {});
  return json({ entriesByWeek });
}

export default function Index() {
  const { entriesByWeek } = useLoaderData();
  const fetcher = useFetcher();

  return (
    <div className="p-8 text-slate-50 bg-slate-900">
      <h1 className="text-3xl font-bold">Weekly Journal</h1>
      <fetcher.Form method="post">
      <fieldset
        className="grid grid-cols-2 disabled:opacity-70"
        disabled={fetcher.state === "submitting"}
      >
          <div className="p-2">
            <label className="block text-slate-500" htmlFor="date">Date</label>
            <input className="text-slate-500 w-full p-1" type="date" id="date" name="date" required />
          </div>
          <div className="p-2">
            <label className="block text-slate-500" htmlFor="type">Type</label>
            <select className="text-slate-500 w-full p-1" id="type" name="type" required>
              <option value="work">Work</option>
              <option value="learning">Learning</option>
              <option value="interesting-thing">Interesting Thing</option>
            </select>
          </div>
          <div className="p-2 col-span-3">
            <label className="block text-slate-500" htmlFor="text">Text</label>
            <textarea className="w-full p-1 h-20 text-slate-400" id="text" name="text" required />
          </div>
        </fieldset>
        <button className="bg-slate-500 p-2" type="submit" disabled={fetcher.state === "submitting"}>
          {fetcher.state === "submitting" ? "Saving..." : "Save"}
        </button>
      </fetcher.Form>
      <section className="grid grid-cols-2 gap-4 mt-5">
      {Object.entries(entriesByWeek).map(([weekStart, entries]) => (
        <div key={weekStart} className="p-6 mb-3 text-slate-500">
          <h2 className="text-lg">Week of {weekStart}</h2>
          {entries.map(entry => (
            <div className="ml-3" key={entry._id}>
              <p>{entry.text}</p>
            </div>
          ))}
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
