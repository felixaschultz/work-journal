import mongoose from "mongoose";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import EntryForm from "~/components/EntryForm";
import { Form } from "@remix-run/react";

const ObjectId = mongoose.Types.ObjectId;
export const loader = async ({ params }) => {
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
            <p>Type: {entry.type}</p>
            <EntryForm entry={entry} />
            <Form method="delete" onSubmit={handleSubmit} >
                <button name="_action"
                    value="delete"
                    className="text-gray-500 underline">
                Delete this entry...
                </button>
            </Form>
        </div>
    );
}

export const action = async ({ request, params }) => {
    const { ObjectId } = mongoose.Types;
    if (typeof params.entryId !== "string" || !ObjectId.isValid(params.entryId)) {
        throw new Response("Not found", { status: 404 });
    }
    
    const formData = await request.formData();
    const { _action, date, type, text } = Object.fromEntries(formData);
  
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    // Save to MongoDB
    if (_action === "delete") {
        await mongoose.models.Entry.deleteOne({ _id: new ObjectId(params.entryId) });
        return redirect("/");
    }else{
        await mongoose.models.Entry.updateOne(
            { _id: new ObjectId(params.entryId) },
            { date: new Date(date), type, text }
        );
        return redirect(`/entries/${params.entryId}/edit`);
    }
};

function handleSubmit(e){
    if (!confirm("Are you sure?")) {
        e.preventDefault();
    }
}