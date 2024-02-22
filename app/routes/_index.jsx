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
      <fetcher.Form method="post">
      <fieldset
        className="disabled:opacity-70"
        disabled={fetcher.state === "submitting"}
      >
          <div>
            <label htmlFor="date">Date</label>
            <input type="date" id="date" name="date" required />
          </div>
          <div>
            <label htmlFor="type">Type</label>
            <select id="type" name="type" required>
              <option value="work">Work</option>
              <option value="learning">Learning</option>
              <option value="interesting-thing">Interesting Thing</option>
            </select>
          </div>
          <div>
            <label htmlFor="text">Text</label>
            <textarea id="text" name="text" required />
          </div>
        </fieldset>
        <button type="submit" disabled={fetcher.state === "submitting"}>
          {fetcher.state === "submitting" ? "Saving..." : "Save"}
        </button>
      </fetcher.Form>
      {Object.entries(entriesByWeek).map(([weekStart, entries]) => (
        <div key={weekStart}>
          <h2>Week of {weekStart}</h2>
          {entries.map(entry => (
            <div key={entry._id}>
              <p>{entry.text}</p>
            </div>
          ))}
        </div>
      ))}
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
