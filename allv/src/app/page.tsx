import { redirect } from "next/navigation";
export default function Home() { redirect("/users"); }
// Redirects to /users page
// In a real app, you might have a landing page or dashboard here
