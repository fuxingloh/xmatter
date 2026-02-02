export default function Layout(props: LayoutProps<"/eip155/[chainId]/[address]">) {
  return <div className="mx-auto w-full max-w-7xl px-5 py-8">{props.children}</div>;
}
