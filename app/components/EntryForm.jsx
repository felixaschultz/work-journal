import { format } from 'date-fns';
import { useRef } from "react";
import { useFetcher } from "@remix-run/react";

export default function EntryForm({ entry }){
    const fetcher = useFetcher();
    let textRef = useRef();

    return <>
        <fieldset
          className="disabled:opacity-70"
          disabled={fetcher.state === "submitting"}
        >
        <fetcher.Form method="post" className="lg:w-1/2 sm:w-full bg-slate-600 m-auto rounded-md border-solid border-2 border-slate-500 border-ra p-4 mt-4">
          <div className="pt-2 pb-2">
            <label className="block text-slate-300" htmlFor="date">Date</label>
            <input className="text-slate-700 p-2" defaultValue={entry?.date ?? format(new Date(), 'yyyy-MM-dd')} type="date" id="date" name="date" required />
          </div>
          <span className="">
            <input defaultChecked={entry?.type === "work"} type="radio" name="type" value="work" id="work" required /> <label className="text-slate-300" htmlFor="work">Work</label>
          </span>
          <span className="ml-5">
            <input defaultChecked={entry?.type === "learning"} type="radio" name="type" value="learning" id="learning" required /> <label className="text-slate-300" htmlFor="learning">Learning</label>
          </span>
          <span className="ml-5">
            <input defaultChecked={entry?.type === "interesting-thing"} type="radio" name="type" value="interesting-thing" id="interesting" required /> <label className="text-slate-300" htmlFor="interesting">Interesting Thing</label>
          </span>
          <div className="pt-3 pb-2 col-span-3">
            <label className="block text-slate-300" htmlFor="text">Text</label>
            <textarea ref={textRef} defaultValue={entry?.text} className="w-full p-1 h-20 text-slate-700" id="text" name="text" required />
          </div>
          <button className="rounded-md w-full bg-slate-500 p-2 disabled:bg-slate-50 items-end" type="submit" disabled={fetcher.state === "submitting"}>
            {fetcher.state === "submitting" ? "Saving..." : "Save"}
          </button>
        </fetcher.Form>
      </fieldset>
    </>
}