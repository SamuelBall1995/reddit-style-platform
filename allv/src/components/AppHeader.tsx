"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  const onUsers = pathname?.startsWith("/users");

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b">
      <div className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/users" className="font-semibold tracking-tight">All Verified — Web</Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant={onUsers ? "default" : "ghost"} size="sm">
            <Link href="/users">Users</Link>
          </Button>
        </nav>
      </div>
      <Separator />
    </header>
  );
}
