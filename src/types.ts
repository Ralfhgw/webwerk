export type PageId = 'home' | 'projekte' | 'kontakt'
export type PagePreviewVariant = 'terminal' | 'photo' | 'contact'

export type PageConfig = {
  id: PageId
  label: string
  eyebrow: string
  title: string
  summary: string
  highlight: string
  command: string
  code: string[]
  output: string[]
  image?: {
    src: string
    alt: string
    position?: string
  }
}

export type ProjectCard = {
  name: string
  stack: string
  text: string
  image?: {
    src: string
    alt: string
  }
}

export type PageLayout = {
  preview: PagePreviewVariant
  sectionClass: string
  previewCardClass: string
}
