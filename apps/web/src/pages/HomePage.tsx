import {
  ArrowRight,
  Bell,
  GitBranch,
  GitPullRequest,
  Layers3,
  Search,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { SiteFooter } from "../components/marketing/SiteFooter"

export function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-transparent bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
          <GitBranch className="size-5" />
          <span>DevSync</span>
        </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost">
              <Link to="/login">Log in</Link>
            </Button>
            <Button>
              <Link to="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[55%] top-12 size-[28rem] rounded-full bg-muted/70 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:py-15">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-foreground" />
              Built for collaborative software teams
            </div>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.75rem]">
              One repository.
              <br />
              <span className="text-muted-foreground">One team.</span>
              <br />
              Always in sync.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              DevSync gives development teams one clear view of repository
              activity, active branches, and potential file overlaps before
              they become merge problems.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-11 px-5">
                <Link to="/signup" className="flex items-center">
                  Create workspace
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          <Card className="rotate-[1deg] border-foreground/10 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)] transition-transform hover:rotate-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Repository overview</CardTitle>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  Live
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border p-2">
                    <GitBranch className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">feature/activity-dashboard</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">3 commits today</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">4 contributors</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border p-2">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">Development team</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Across 6 projects</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">12 active</span>
              </div>
              <div className="rounded-xl border bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Zap className="size-4" />
                  Shared update
                </div>
                <p className="text-sm text-muted-foreground">
                  3 branches changed components/HomePage.tsx this week
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y bg-muted/25">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium tracking-[0.18em] text-muted-foreground">
              Core product areas
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Keep repository work visible to the whole team
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              DevSync turns Git activity into clear, coordinated team context.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Card className="border-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                  <Layers3 className="size-5" />
                </div>
                <CardTitle>Repository activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">
                  Follow branches, commits, merge requests, and recent team
                  changes from one focused feed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                  <GitPullRequest className="size-5" />
                </div>
                <CardTitle>Branch coordination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">
                  Identify where work overlaps across active branches using
                  available provider data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                  <Bell className="size-5" />
                </div>
                <CardTitle>Relevant updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">
                  Design notification views around projects and teams so
                  important updates reach the right people.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.18em] text-muted-foreground">
            Use cases
          </p>
          <h2 className="w-full text-3xl font-semibold tracking-tight">
            Better decisions throughout the development workflow
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
          <article className="bg-background p-7">
            <Search className="mb-5 size-5" />
            <h3 className="mb-2 font-semibold">Spot merge risks early</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Surface branches that are changing the same files so teammates
              can coordinate before conflicts grow.
            </p>
          </article>
          <article className="bg-background p-7">
            <Users className="mb-5 size-5" />
            <h3 className="mb-2 font-semibold">Stay aligned at scale</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Give distributed and growing teams a shared picture of work
              across repositories and projects.
            </p>
          </article>
          <article className="bg-background p-7">
            <GitBranch className="mb-5 size-5" />
            <h3 className="mb-2 font-semibold">Help developers onboard</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Use recent activity and repository context to understand where
              work is happening and where decisions have been made.
            </p>
          </article>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium tracking-[0.18em] text-muted-foreground">
              Why DevSync
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              One source of team and repository context
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Zap className="mt-0.5 size-5 shrink-0" />
              <div>
                <h3 className="font-medium">Less status chasing</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find activity and progress without opening every branch or
                  asking for a manual update.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <div>
                <h3 className="font-medium">Organization-aware</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Team boundaries are central to the platform so repository
                  context stays properly scoped.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Make every repository change easier to understand
            </h2>
            <p className="mt-2 text-primary-foreground/75">
              Bring your team and repository activity into one workspace.
            </p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="shrink-0"
          >
            <Link to="/signup" className="flex items-center">
              Get started
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}