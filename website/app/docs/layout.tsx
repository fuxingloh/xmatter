import { cx } from "@/components/cx";
import { ActiveLink } from "@/components/ActiveLink";

const links = [
  { href: "/docs", label: "Xmatter" },
  { href: "Header-Standards", label: "Standards" },
  { href: "/docs/standards/path", label: "Xmatter Path" },
  { href: "/docs/standards/markdown", label: "README.md" },
  { href: "Header-Developers", label: "Developers" },
  { href: "/docs/api", label: "API Reference" },
  { href: "/docs/javascript", label: "JavaScript Client" },
  { href: "/docs/nextjs", label: "Next.js" },
  { href: "/docs/rate-limits", label: "Rate Limits" },
];

export default function Layout(props: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-16 pb-32">
      <div className="flex gap-8">
        <aside className="max-w-56 grow max-md:hidden">
          <ul>
            {links.map((link) => {
              if (link.href.startsWith("Header-")) {
                return (
                  <li key={link.href}>
                    <h4 className="text-mono-950 mt-6 border-l-2 border-transparent py-1.5 pl-2.5 text-sm font-medium uppercase">
                      {link.label}
                    </h4>
                  </li>
                );
              }

              return (
                <li key={link.href}>
                  <ActiveLink
                    href={link.href}
                    className="text-mono-500 hover:text-mono-950 hover:bg-mono-200/50 block border-l-2 border-transparent py-1.5 pl-2.5 text-[15px]"
                    activeClassName="!text-mono-950 !border-mono-700"
                  >
                    {link.label}
                  </ActiveLink>
                </li>
              );
            })}
          </ul>
        </aside>
        <article
          className={cx(
            "prose prose-base w-full",
            "prose-headings:font-medium prose-h1:text-3xl prose-h2:text-[23px]",
            "text-mono-600 prose-headings:text-mono-950 prose-code:text-mono-700 prose-a:text-mono-700 prose-blockquote:text-mono-700",
            "prose-pre:bg-mono-100 prose-pre:text-mono-950",
          )}
        >
          {props.children}
        </article>
      </div>
    </div>
  );
}
