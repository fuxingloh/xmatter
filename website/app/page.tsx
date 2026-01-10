import { clsx } from "clsx";
import { getInstalledNamespaces } from "crypto-frontmatter";
import Link from "next/link";
import type { ReactElement } from "react";

export default async function Page(): Promise<ReactElement> {
  const namespaces = await getInstalledNamespaces();
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
              <th>CAIP2/NAMESPACE</th>
              <th>NPM PACKAGE NAME</th>
            </tr>
          </thead>

          <tbody>
            {namespaces.map((item) => (
              <tr key={`${item.caip2}/${item.namespace}`} className="text-mono-200 hover:bg-mono-950">
                <td>
                  <Link href={`/${item.caip2}/${item.namespace}`} className="-my-2.5 block py-2.5">
                    {item.caip2}/{item.namespace}
                  </Link>
                </td>
                <td>{item.package}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
