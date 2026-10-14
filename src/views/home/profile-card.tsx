import { avatarSrc, avatarSrcSet, formatJoined } from "@/lib/format";
import type { Profile } from "@/lib/github";
import { useId } from "react";
import ProfileLinks from "./profile-links";
import ProfileStats from "./profile-stats";

type ProfileCardProps = { profile: Profile; busy?: boolean };

export default function ProfileCard({ profile, busy }: ProfileCardProps) {
  const nameId = useId();

  return (
    <article
      aria-labelledby={nameId}
      aria-busy={busy}
      className="bg-card rounded-card shadow-card grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 px-6 pt-8 pb-12 md:gap-x-10 md:p-10 lg:items-start lg:gap-x-9 lg:p-12 dark:shadow-none"
    >
      <img
        src={avatarSrc(profile.avatarUrl, 117)}
        srcSet={avatarSrcSet(profile.avatarUrl)}
        sizes="(min-width: 48rem) 117px, 70px"
        width={117}
        height={117}
        alt=""
        fetchPriority="high"
        className="size-17.5 rounded-full md:size-29.25 lg:row-span-2"
      />
      <div className="flex flex-col lg:-mt-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-3">
        <h2
          id={nameId}
          className="text-ink md:text-title font-bold wrap-break-word"
        >
          {profile.name}
        </h2>
        <a
          href={profile.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="v-link text-handle text-label max-w-full place-self-start truncate md:mt-0.5 md:text-base lg:col-span-2"
        >
          @{profile.login}
        </a>
        <p className="text-subtle text-label md:text-body mt-1 md:mt-0.5 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:leading-(--text-title--line-height)">
          Joined{" "}
          <time dateTime={profile.joinedAt}>
            {formatJoined(profile.joinedAt)}
          </time>
        </p>
      </div>
      <div className="col-span-2 lg:col-span-1 lg:col-start-2">
        <p
          className={`text-label/6.25 md:text-body mt-8 wrap-break-word md:mt-6 lg:mt-5 ${profile.bio ? "text-muted" : "text-faded"}`}
        >
          {profile.bio ?? "This profile has no bio"}
        </p>
        <ProfileStats
          repos={profile.repos}
          followers={profile.followers}
          following={profile.following}
        />
        <ProfileLinks
          location={profile.location}
          website={profile.website}
          twitter={profile.twitter}
          company={profile.company}
        />
      </div>
    </article>
  );
}
