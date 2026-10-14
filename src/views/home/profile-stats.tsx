import type { Profile } from "@/lib/github";

type ProfileStatsProps = Pick<Profile, "repos" | "followers" | "following">;

export default function ProfileStats({
  repos,
  followers,
  following,
}: ProfileStatsProps) {
  const stats = [
    ["Repos", repos],
    ["Followers", followers],
    ["Following", following],
  ] as const;

  return (
    <dl className="bg-page rounded-inner mt-6 grid grid-cols-3 px-4 py-4.5 text-center md:mt-8 md:grid-cols-[8.6875rem_9.625rem_1fr] md:px-8 md:py-4 md:text-left">
      {stats.map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted text-caption md:text-label">{label}</dt>
          <dd className="text-ink md:text-stat mt-2 font-bold md:mt-0">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
