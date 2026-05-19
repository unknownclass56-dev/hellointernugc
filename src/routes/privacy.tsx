import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: "Privacy Policy — TechLaunchpad" }, { name: "description", content: "How TechLaunchpad collects, uses and protects your data." }],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <PageShell>
      <article className="container mx-auto max-w-3xl px-4 py-16 prose prose-headings:font-display prose-headings:text-navy-deep">
        <h1>Privacy Policy</h1>
        <p>Last updated: May 14, 2026</p>
        <p>This Privacy Policy describes how TechLaunchpad ("we", "us") collects, uses and shares information from users of our platform.</p>
        <h2>Information we collect</h2>
        <ul>
          <li>Account information (name, email, phone, college).</li>
          <li>Application data (resumes, cover letters, profile details).</li>
          <li>Usage data (pages visited, actions taken).</li>
        </ul>
        <h2>How we use information</h2>
        <ul>
          <li>To deliver internship matching, application processing and certificate issuance.</li>
          <li>To send you transactional and product notifications.</li>
          <li>To improve our platform and services.</li>
        </ul>
        <h2>Sharing</h2>
        <p>We share your application data only with companies you apply to. We do not sell your personal data.</p>
        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:support@techlaunchpad.in">support@techlaunchpad.in</a>.</p>
      </article>
    </PageShell>
  );
}
