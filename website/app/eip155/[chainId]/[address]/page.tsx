export function generateStaticParams() {
  return [
    { chainId: "11155111", address: "0x0bd5f04b456ab34a2ab3e9d556fe5b3a41a0bc8d" },
    { chainId: "1313161554", address: "0x8bec47865ade3b172a928df8f990bc7f2a3b9f79" },
  ];
}

export const dynamicParams = false;
//
// export async function generateStaticParams() {
//
//
//   return namespaces.map((namespace) => {
//     return {
//       caip2: namespace.caip2,
//       slug: namespace.namespace,
//     };
//   });
// }

// export async function generateMetadata(props: PageProps<'/eip155/[chainId]/[address]'>) {
//
// }

export default async function Page(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;

  const { default: README, metadata } = await import(`../../../../../xmatter/eip155/${chainId}/${address}/README.md`);

  return (
    <div>
      <p></p>

      <README />
    </div>
  );
}
