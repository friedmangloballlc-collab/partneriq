import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <SEO title="Privacy Policy" description="How Dealstage collects, uses, and protects your personal data" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Deal Stage
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 18, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Information We Collect</h2>
            <p><strong>Account Information:</strong> Name, email address, role (brand/talent/agency), company name, and profile details you provide during registration.</p>
            <p><strong>Social Media Data:</strong> When you connect social accounts, we collect public profile information, follower counts, engagement metrics, and audience demographics. We access only data you explicitly authorize.</p>
            <p><strong>Usage Data:</strong> Pages visited, features used, AI agent interactions, and performance metrics to improve the service.</p>
            <p><strong>Payment Data:</strong> Payment processing is handled by Stripe. We do not store credit card numbers. We retain transaction records and subscription status.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. How We Use Your Information</h2>
            <p>We use your information to: (a) provide and improve the Platform; (b) match talent with brands using AI algorithms; (c) generate analytics and reports; (d) process payments; (e) send service-related communications; (f) ensure platform security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. AI Data Processing</h2>
            <p>Our AI features analyze your data to provide insights, predictions, and recommendations. AI processing occurs on secure servers. We use third-party AI providers (Anthropic, DeepSeek, Google, Groq) to process prompts — your personal data is not included in AI prompts unless required for the specific feature you're using. AI providers do not retain your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Data Sharing</h2>
            <p>We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Providers:</strong> Supabase (database), Stripe (payments), Vercel (hosting), and AI providers for platform functionality.</li>
              <li><strong>Other Users:</strong> Your public profile information is visible to other Platform users based on your privacy settings.</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. Data Security</h2>
            <p>We implement industry-standard security measures including: encryption in transit (TLS/SSL), encrypted database storage, Row-Level Security policies, OAuth 2.0 for social connections, and regular security audits. No system is 100% secure — we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Upon account deletion, we remove your personal data within 30 days, except where required by law or for legitimate business purposes (e.g., fraud prevention, financial records).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">7. Your Rights</h2>
            <p>You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) delete your account and data; (d) export your data; (e) disconnect social accounts at any time; (f) opt out of non-essential communications. To exercise these rights, contact us at <a href="mailto:privacy@thedealstage.com" className="text-indigo-600 hover:underline">privacy@thedealstage.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">8. Cookies & Tracking</h2>
            <p>We use essential cookies for authentication and session management. We use Google Analytics for usage analytics. You can disable non-essential cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">9. Children's Privacy</h2>
            <p>The Platform is not intended for users under 18. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">10. California Privacy Rights (CCPA)</h2>
            <p>California residents have additional rights including: the right to know what data we collect, the right to delete, and the right to opt out of data sales (we do not sell data). Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy at any time. We will notify you of material changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">12. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:privacy@thedealstage.com" className="text-indigo-600 hover:underline">privacy@thedealstage.com</a>.</p>
            <p>DealStage LLC<br />www.thedealstage.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
