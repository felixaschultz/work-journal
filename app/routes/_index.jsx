import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useFetcher } from "@remix-run/react";

export async function loader() {
  const entries = await mongoose.models.Entry.find({});
  return json({ entries });
}

export default function Index() {
  const { entries } = useLoaderData();
  const fetcher = useFetcher();

  return (
    <div className="p-8 text-slate-50 bg-slate-900">
      <fetcher.Form method="post">
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
        <button type="submit">Submit</button>
      </fetcher.Form>
    </div>
  );
}

export const action = async ({ request }) => {
  const formData = await request.formData();

	// with desctructuring
	const { date, type, text } = Object.fromEntries(formData);

  // Save to MongoDB
  return await mongoose.models.Entry.create({ date, type, text });
};
