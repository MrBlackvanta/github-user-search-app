import {
  CompanyIcon,
  LocationIcon,
  TwitterIcon,
  WebsiteIcon,
} from "@/components/icons";
import type { Profile } from "@/lib/github";

type ProfileLinksProps = Pick<
  Profile,
  "location" | "website" | "twitter" | "company"
>;

export default function ProfileLinks({
  location,
  website,
  twitter,
  company,
}: ProfileLinksProps) {
  const details = [
    { label: "Location", Icon: LocationIcon, detail: location },
    { label: "Website", Icon: WebsiteIcon, detail: website },
    { label: "Twitter", Icon: TwitterIcon, detail: twitter },
    { label: "Company", Icon: CompanyIcon, detail: company },
  ];

  return (
    <dl className="mt-6 grid grid-cols-1 gap-4 md:mt-7 md:grid-flow-col md:grid-cols-[14.0625rem_minmax(0,1fr)] md:grid-rows-2 md:gap-x-12 lg:mt-9">
      {details.map(({ label, Icon, detail }) => (
        <div
          key={label}
          className={`flex items-center gap-3 md:gap-4 ${detail ? "text-muted" : "text-faint"}`}
        >
          <dt className="flex w-5 shrink-0">
            <Icon />
            <span className="sr-only">{label}</span>
          </dt>
          <dd className="text-label md:text-body flex min-w-0">
            {detail?.href ? (
              <a
                href={detail.href}
                target="_blank"
                rel="noopener noreferrer"
                className="v-link truncate"
              >
                {detail.text}
              </a>
            ) : (
              <span className="truncate">
                {detail?.text ?? "Not Available"}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
