import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [{ title: "Terms & Conditions — TechLaunchpad" }, { name: "description", content: "Terms governing your use of TechLaunchpad." }],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});

function TermsPage() {
  return (
    <PageShell>
      <article className="container mx-auto max-w-3xl px-4 py-16 prose prose-headings:font-display prose-headings:text-navy-deep">
        <h1>Terms & Conditions</h1>
        <p>Last updated: May 14, 2026</p>
        <p>By accessing or using TechLaunchpad, you agree to be bound by these Terms.</p>
        <h2>Eligibility</h2>
        <p>You must be 16 years or older to use the platform. Students under 18 should obtain guardian consent.</p>
        <h2>Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your credentials and all activity under your account.</p>
        <h2>Content</h2>
        <p>You retain ownership of content you submit but grant us a license to host, display and process it for the purpose of operating the platform.</p>
        <h2>Prohibited Use</h2>
        <p>Misrepresentation, scraping, or any activity that breaches Indian law is strictly prohibited.</p>
        <h2>Termination</h2>
        <p>We may suspend or terminate accounts that violate these Terms.</p>
        <h2>Contact</h2>
        <p><a href="mailto:support@techlaunchpad.in">support@techlaunchpad.in</a></p>
      </article>
    </PageShell>
  );
}
