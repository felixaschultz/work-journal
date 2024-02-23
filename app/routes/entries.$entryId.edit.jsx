import mongoose from "mongoose";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }) => {
    const ObjectId = mongoose.Types.ObjectId;
    if (typeof params.entryId !== "string" || !ObjectId.isValid(params.entryId)) {
        throw new Response("Not found", { status: 404 });
    }
    let entry = await mongoose.models.Entry.findById(params.entryId);
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
            <h2 className="text-lg my-2">Editing Entry { entry._doc._id }</h2>
            <h1 className="text-2xl">{entry._doc.text}</h1>
        </div>
    );
}