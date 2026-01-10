import { clsx } from "clsx";
import { getIndex } from "crypto-frontmatter";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactElement } from "react";

export async function generateMetadata(caip2: string, namespace: string): Promise<Metadata> {
  const title = `${caip2}/${namespace}`;

  return {
    title: title,
    openGraph: {
      title: title,
      url: `${process.env.BASE_URL}/${caip2}/${namespace}`,
      siteName: `xMatter`,
      locale: "en_US",
      type: "article",
    },
  };
}

export async function Page(props: { caip2: string; namespace: string }): Promise<ReactElement> {
  const index = await getIndex(props.caip2, props.namespace);
  if (index === undefined) {
    return notFound();
  }

  return (
    <main>
      <div className="mx-auto w-full overflow-x-auto pb-48">
        <table
          className={clsx(
            "min-w-full",
            "whitespace-nowrap text-left lg:whitespace-normal",
            "[&_tr_:is(th,td)]:font-normal",
            "[&_tr_:is(th,td)]:px-2 [&_tr_:is(th,td)]:py-2.5",
            "divide-y divide-mono-900",
            "[&_tbody]:divide-y [&_tbody]:divide-mono-900",
          )}
        >
          <thead className="text-sm text-mono-600">
            <tr>
              <th>CAIP19</th>
              <th>SYMBOL</th>
              <th>DECIMALS</th>
              <th>TITLE</th>
            </tr>
          </thead>

          <tbody>
            {index.map((item) => (
              <tr key={item.path} className="text-mono-200 hover:bg-mono-950">
                <td>
                  <Link href={`/${item.path}`} className="-my-2.5 block py-2.5">
                    {item.path}
                  </Link>
                </td>
                <td>{item.fields.symbol}</td>
                <td>{item.fields.decimals}</td>
                <td>{item.fields.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
