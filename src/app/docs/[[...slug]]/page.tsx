import { getMDXComponents } from "@/components/mdx"
import { source } from "@/lib/source"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page"
import { notFound, redirect } from "next/navigation"

interface PageProps {
  params: Promise<{
    slug?: string[]
  }>
}

const trialComponentPages = new Set([
  "experiment",
  "lot",
  "steps",
  "runcard",
  "wafer",
  "wafer-defect",
  "runcard-history",
  "history",
])

const sharedComponentPages = new Set(["wafer-map"])

const knowledgePages = new Set([
  "business-loop",
  "design-system",
  "concepts",
  "component-boundaries",
  "open-questions",
  "coding-rules",
])

function redirectLegacyDocsPath(slug?: string[]) {
  if (!slug) return

  const [first, second, third] = slug

  if (
    first === "domain" &&
    second === "trial" &&
    third &&
    sharedComponentPages.has(third)
  ) {
    redirect(`/docs/domain/shared/${third}`)
  }

  if (
    first === "domain" &&
    second === "report" &&
    third &&
    sharedComponentPages.has(third)
  ) {
    redirect(`/docs/domain/shared/${third}`)
  }

  if (
    first === "domain" &&
    second === "report" &&
    third &&
    trialComponentPages.has(third)
  ) {
    redirect(`/docs/domain/trial/${third}`)
  }

  if (
    first === "components" &&
    second === "domain" &&
    third &&
    sharedComponentPages.has(third)
  ) {
    redirect(`/docs/domain/shared/${third}`)
  }

  if (
    first === "components" &&
    second === "domain" &&
    third &&
    trialComponentPages.has(third)
  ) {
    redirect(`/docs/domain/trial/${third}`)
  }

  if (first === "components" && second === "ui" && third) {
    redirect(`/docs/ui/${third}`)
  }

  if (first === "domain" && second && knowledgePages.has(second)) {
    redirect(`/docs/knowledge/${second}`)
  }
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) {
    redirectLegacyDocsPath(params.slug)
    notFound()
  }

  const MDX = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) {
    redirectLegacyDocsPath(params.slug)
    notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
