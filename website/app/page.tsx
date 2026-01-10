import { clsx } from "clsx";
import { getInstalledNamespaces } from "crypto-frontmatter";
import Link from "next/link";

export default async function Page() {
  const namespaces = await getInstalledNamespaces();
  return (
    <main>
      <div className="mx-auto w-full overflow-x-auto pb-48">
        <table
          className={clsx(
            "min-w-full",
            "text-left whitespace-nowrap lg:whitespace-normal",
            "[&_tr_:is(th,td)]:font-normal",
            "[&_tr_:is(th,td)]:px-2 [&_tr_:is(th,td)]:py-2.5",
            "divide-mono-100 divide-y",
            "[&_tbody]:divide-mono-100 [&_tbody]:divide-y",
          )}
        >
          <thead className="text-mono-500 text-sm">
            <tr>
              <th>CAIP2/NAMESPACE</th>
              <th>NPM PACKAGE NAME</th>
            </tr>
          </thead>

          <tbody>
            {namespaces.map((item) => (
              <tr key={`${item.caip2}/${item.namespace}`} className="hover:bg-mono-50">
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
