import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/techlaunchpad-logo.png";
import { ApprovalBadge } from "./ApprovalBadge";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-gradient-to-b from-navy-deep to-[oklch(0.13_0.06_262)] text-ivory">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="TechLaunchpad" className="size-14 object-contain bg-white rounded-full p-1" />
              <div>
                <div className="font-display text-xl font-bold">TechLaunchpad</div>
                <div className="text-[10px] tracking-[0.25em] text-gold">LEARN · GROW · LAUNCH.</div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ivory/75">
              TechLaunchpad is an industry-focused internship and training platform providing AICTE aligned,
              UGC guided, BSDM supported and ISO certified learning opportunities.
            </p>
            <div className="mt-6 space-y-2 text-sm text-ivory/80">
              <div className="flex items-start gap-2"><MapPin className="size-4 shrink-0 mt-0.5 text-gold" /> Plot 14, Knowledge Park, New Delhi, India 110001</div>
              <div className="flex items-center gap-2"><Mail className="size-4 text-gold" /> support@techlaunchpad.in</div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 font-display text-base font-semibold text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-ivory/80">
              <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
              <li><Link to="/programs" className="hover:text-gold">Programs</Link></li>
              <li><Link to="/internships" className="hover:text-gold">Internships</Link></li>
              <li><Link to="/internship/login" className="hover:text-gold text-blue-300">Internship Login</Link></li>
              <li><Link to="/training/login" className="hover:text-gold text-blue-300">Training Login</Link></li>
              <li><Link to="/sales/login" className="hover:text-gold text-amber-300">Sales Login</Link></li>
              <li><Link to="/admin/login" className="hover:text-gold text-red-300">Admin Login</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 font-display text-base font-semibold text-gold">Programs</h4>
            <ul className="space-y-2 text-sm text-ivory/80">
              <li><Link to="/programs/aicte" className="hover:text-gold">AICTE Approved</Link></li>
              <li><Link to="/programs/ugc" className="hover:text-gold">UGC Approved</Link></li>
              <li><Link to="/programs/bsdm" className="hover:text-gold">BSDM Approved</Link></li>
              <li><Link to="/programs/iso" className="hover:text-gold">ISO Certified</Link></li>
              <li><Link to="/verify" className="hover:text-gold">Verify Certificate</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="mb-4 font-display text-base font-semibold text-gold">Recognitions</h4>
            <div className="grid grid-cols-2 gap-3">
              <ApprovalBadge kind="AICTE" variant="dark" />
              <ApprovalBadge kind="UGC" variant="dark" />
              <ApprovalBadge kind="BSDM" variant="dark" />
              <ApprovalBadge kind="ISO" variant="dark" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ivory/55">
              Disclaimer: Approval & certification badges shown above represent program alignment with the respective bodies. Specific scheme details and certificate numbers are available on each program page and on request from <a href="mailto:support@techlaunchpad.in" className="text-gold underline-offset-2 hover:underline">support@techlaunchpad.in</a>.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-ivory/60">© {new Date().getFullYear()} TechLaunchpad. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-ivory/70">
            <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <span className="opacity-30">·</span>
            <Link to="/terms" className="hover:text-gold">Terms & Conditions</Link>
          </div>
          <div className="flex items-center gap-3 text-ivory/70">
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="size-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gold"><Twitter className="size-4" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="size-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-gold"><Linkedin className="size-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gold"><Youtube className="size-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
