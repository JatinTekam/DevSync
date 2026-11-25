import { useState } from "react"
import {
  ArrowRight,
  GitBranch,
  GitPullRequest,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { SignupForm } from "../components/SignupForm"

export function SignupPage() {
  const [notice, setNotice] = useState("")

  const handleSignup = async () => {
    setNotice("Your details are valid. Account creation is coming soon.")
  }

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GitBranch className="size-5" />
          </span>
          DevSync
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to home
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-5">
        <div className="relative isolate flex min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-10 lg:min-h-0 lg:p-8 xl:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 -z-10 size-80 rounded-full border border-primary-foreground/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 -z-10 size-56 rounded-full border border-primary-foreground/10"
          />

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-1.5 text-xs font-medium text-primary-foreground/80">
              <span className="size-1.5 rounded-full bg-primary-foreground" />
              Built for teams that build together
            </div>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Good work happens when everyone is in sync.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-primary-foreground/70">
              Bring your repositories, branches, and team activity into one
              shared view.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.06] p-4 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Team activity</p>
                <p className="mt-1 text-xs text-primary-foreground/55">
                  Your work, connected
                </p>
              </div>
              <span className="rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[11px] font-medium text-primary-foreground/75">
                JUST NOW
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <GitBranch className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">feature/activity-feed</p>
                  <p className="mt-0.5 text-xs text-primary-foreground/55">
                    New commits pushed
                  </p>
                </div>
                <ArrowRight className="size-4 text-primary-foreground/40" />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <GitPullRequest className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Branch overlap spotted</p>
                  <p className="mt-0.5 text-xs text-primary-foreground/55">
                    2 teammates are touching shared files
                  </p>
                </div>
                <Users className="size-4 text-primary-foreground/40" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-4 lg:px-6 lg:py-4">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl border bg-background shadow-sm">
                <Users className="size-5" />
              </div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                YOUR TEAM WORKSPACE
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Create your account
              </h2>
              <p className="mt-2 text-muted-foreground">
                Start bringing your team’s repository work together.
              </p>
            </div>

            <SignupForm onSubmit={handleSignup} />

            {notice && (
              <p
                className="mt-4 rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground"
                role="status"
              >
                {notice}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" />
              Your team’s repository data stays private.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
