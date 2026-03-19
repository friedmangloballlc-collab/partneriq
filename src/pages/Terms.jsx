import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <SEO title="Terms of Service" description="Terms and conditions for using the Dealstage platform" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Deal Stage
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 18, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Acceptance of Terms</h2>
            <p>By accessing or using Deal Stage ("the Platform"), operated by DealStage LLC, you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. Description of Service</h2>
            <p>Deal Stage is a creator partnership intelligence platform that connects brands, talent, and agencies. The Platform provides AI-powered talent discovery, partnership management, outreach tools, analytics, and marketplace features.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Account Registration</h2>
            <p>You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Subscription Plans & Payments</h2>
            <p>Paid subscriptions are billed monthly or annually through Stripe. Prices are listed on the Platform and may change with 30 days' notice. Refunds are handled on a case-by-case basis. Free tier accounts have limited access to features as described on the pricing page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. User Content & Data</h2>
            <p>You retain ownership of all content you upload. By using the Platform, you grant Deal Stage a license to process, display, and analyze your data solely for providing the service. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">6. Social Platform Connections</h2>
            <p>When you connect social media accounts, we access only the data you authorize via OAuth or API. Access is read-only. We never post, modify, or store your social media credentials. You can disconnect accounts at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">7. AI Features</h2>
            <p>The Platform uses artificial intelligence for analytics, recommendations, and content generation. AI outputs are provided as suggestions and should not be considered professional advice. You are responsible for reviewing and approving all AI-generated content before use.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">8. Prohibited Conduct</h2>
            <p>You may not: (a) use the Platform for any unlawful purpose; (b) scrape, crawl, or harvest data from the Platform; (c) impersonate another person or entity; (d) interfere with the Platform's operation; (e) share account credentials with unauthorized parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">9. Limitation of Liability</h2>
            <p>Deal Stage is provided "as is" without warranties of any kind. To the maximum extent permitted by law, DealStage LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">10. Termination</h2>
            <p>We may suspend or terminate your account for violations of these Terms. You may cancel your account at any time. Upon cancellation, your data will be retained for 30 days before deletion unless you request immediate deletion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">11. Changes to Terms</h2>
            <p>We may update these Terms at any time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">12. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@thedealstage.com" className="text-indigo-600 hover:underline">legal@thedealstage.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
