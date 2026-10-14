import { SiteHeader } from "@/components/layout";
import { octocat } from "@/data";
import { toProfile } from "@/lib/github";
import { UserSearch } from "@/views/home";
import { preconnect } from "react-dom";

export default function Home() {
  preconnect("https://avatars.githubusercontent.com");

  return (
    <>
      <SiteHeader logoAs="h1" />
      <main>
        <UserSearch initialProfile={toProfile(octocat)} />
      </main>
    </>
  );
}
