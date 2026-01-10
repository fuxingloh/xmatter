import { decodeCaip19, getInstalledNamespaces } from "crypto-frontmatter";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import * as AssetPage from "@/app/[caip2]/[slug]/AssetPage";
import * as NamespacePage from "@/app/[caip2]/[slug]/NamespacePage";

export async function generateStaticParams(): Promise<Parameters<typeof Page>[0]["params"][]> {
  const namespaces = await getInstalledNamespaces();
  return namespaces.map((namespace) => {
    return {
      caip2: namespace.caip2,
      slug: namespace.namespace,
    };
  });
}

export async function generateMetadata(props: Parameters<typeof Page>[0]): Promise<Metadata> {
  const path = `${decodeURIComponent(props.params.caip2)}/${decodeURIComponent(props.params.slug)}`;
  const [caip2, namespace, reference] = decodeCaip19(path);

  if (caip2 && namespace && reference) {
    return AssetPage.generateMetadata(path);
  }

  if (caip2 && namespace) {
    return NamespacePage.generateMetadata(caip2, namespace);
  }

  return notFound();
}

export default async function Page(props: {
  params: {
    caip2: string;
    slug: string;
  };
}): Promise<ReactElement> {
  if (props.params.caip2.startsWith("_")) {
    // This route conflicts with public/_crypto-frontmatter static assets.
    // This is an early termination to avoid unnecessary processing.
    return notFound();
  }

  const path = `${decodeURIComponent(props.params.caip2)}/${decodeURIComponent(props.params.slug)}`;
  const [caip2, namespace, reference] = decodeCaip19(path);

  if (caip2 && namespace && reference) {
    return AssetPage.Page({
      caip19: path,
    });
  }

  if (caip2 && namespace) {
    return NamespacePage.Page({
      caip2: caip2,
      namespace: namespace,
    });
  }

  return notFound();
}
