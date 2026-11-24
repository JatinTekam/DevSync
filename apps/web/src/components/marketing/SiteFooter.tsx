import { GitBranch } from "lucide-react"
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom"

interface FooterLink {
  label: string
  to: string
}

interface SiteFooterProps {
  links?: FooterLink[]
}

const defaultLinks: FooterLink[] = [
  { label: "Log in", to: "/login" },
  { label: "Get started", to: "/signup" },
]

export function SiteFooter({ links = defaultLinks }: SiteFooterProps) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <GitBranch className="size-4" />
            <span>DevSync</span>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            One repository. One team. Always in sync.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit GitHub"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <FaGithub className="size-5" />
          </a>
        </nav>
      </div>
    </footer>
  )
}
