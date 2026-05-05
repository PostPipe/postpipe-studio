import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl pt-24 pb-0 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center space-x-3 mb-6">
            <Image
              src="/Postpipe-Studio.svg"
              alt="Postpipe Studio Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold text-white tracking-tight">Postpipe Studio</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            The next generation of backend development. Design, deploy, and scale with visual logic and high-performance Rust runtime.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest text-zinc-400">Product</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li><Link href="/how-it-works" className="hover:text-cyan-400 transition-colors">How it Works</Link></li>
            <li><Link href="/demo" className="hover:text-cyan-400 transition-colors">Demo</Link></li>
            <li><Link href="https://postpipe.in/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
            <li><Link href="https://postpipe.in/integrations" className="hover:text-cyan-400 transition-colors">Integrations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest text-zinc-400">Resources</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li><Link href="https://postpipe.in/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
            <li><Link href="https://postpipe.in/api-reference" className="hover:text-cyan-400 transition-colors">API Reference</Link></li>
            <li><Link href="https://discord.gg/postpipe" className="hover:text-cyan-400 transition-colors">Community</Link></li>
            <li><Link href="https://postpipe.in/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest text-zinc-400">Company</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li><Link href="https://postpipe.in/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
            <li><Link href="https://postpipe.in/careers" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
            <li><Link href="https://postpipe.in/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="https://postpipe.in/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-zinc-600">
        <p>© 2026 Postpipe Studio Inc. All rights reserved.</p>
        <div className="flex space-x-6">
          <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
          <Link href="#" className="hover:text-white transition-colors">Discord</Link>
        </div>
      </div>
    </footer>
  );
}
