import mongoose from "mongoose";
import { Link, useLoaderData } from "@remix-run/react";
import EntryForm from "~/components/EntryForm";

export const loader = async ({ params }) => {
    const ObjectId = mongoose.Types.ObjectId;
    if (typeof params.entryId !== "string" || !ObjectId.isValid(params.entryId)) {
        throw new Response("Not found", { status: 404 });
    }

    let entry = await mongoose.models.Entry.findById(params.entryId).lean().exec();

    if (!entry) {
        throw new Response("Not found", { status: 404 });
    }

    return {
        ...entry,
        date: entry.date.toISOString().substring(0, 10),
    }
};

export default function Page() {
    const entry = useLoaderData();
    return (
        <div className="p-8 text-slate-50 w-1/2 m-auto mt-10">
            <Link to="/" className="block min-w-max w-fit py-2 px-11 text-slate-100 bg-slate-500 rounded-md">Back</Link>
            <h2 className="text-lg my-2">Editing Entry { entry._id }</h2>
            <h1 className="text-2xl">{entry.text}</h1>
            <EntryForm entry={entry} />
        </div>
    );
}