import { createCookieSessionStorage } from "@remix-run/node";

export const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: "work-journal-session",
    },
})