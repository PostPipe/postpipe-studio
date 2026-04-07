'use client';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { StudioBranding } from "@/components/ui/studio-branding";
import { motion } from "framer-motion";
import { 
  Database, 
  Workflow, 
  Share2, 
  Layout, 
  Terminal, 
  Cpu, 
  Zap, 
  ShieldCheck,
  HelpCircle 
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Data Architecture",
      description: "Define your data models and relationships using our visual schema builder. PostPipe automatically generates the underlying database structures and migrations.",
      icon: <Database className="w-8 h-8 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/20"
    },
    {
      title: "Logic & Workflows",
      description: "Connect nodes to build complex logic. From authentication flows to data processing pipelines, our visual engine handles it all without a single line of boilerplate code.",
      icon: <Workflow className="w-8 h-8 text-purple-400" />,
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Instant API Generation",
      description: "As you design, your REST and GraphQL APIs are created in real-time. Secure, typed, and fully documented endpoints are ready for your frontend in seconds.",
      icon: <Share2 className="w-8 h-8 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      title: "Deployment & Scaling",
      description: "One-click deployment to globally distributed edge nodes. PostPipe manages the infrastructure, scaling, and security patches so you can focus on building your product.",
      icon: <Zap className="w-8 h-8 text-orange-400" />,
      color: "from-orange-500/20 to-red-500/20"
    }
  ];

  return (
    <main className="relative min-h-screen bg-black overflow-x-hidden font-sans">
      <Navbar />
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 opacity-40">
        <BackgroundGradientAnimation 
          gradientBackgroundStart="rgb(10, 10, 30)"
          gradientBackgroundEnd="rgb(0, 0, 0)"
          containerClassName="h-full w-full"
        />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4">
        {/* Hero Title */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-white mb-6">
              The Architecture <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Behind the Engine.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              PostPipe Studio isn't just a visual builder. It's a high-performance backend architecture that transforms design into functional logic.
            </p>
          </motion.div>
        </div>

        {/* The Flow - Visual Steps */}
        <section className="max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative group p-8 rounded-3xl border border-white/10 bg-gradient-to-br ${step.color} backdrop-blur-xl hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl hover:scale-[1.02]`}
              >
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
                
                <div className="flex flex-col h-full">
                  <div className="p-3 bg-white/5 rounded-2xl w-fit mb-6 border border-white/10">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed text-sm md:text-base font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Steps Grid ... existing steps ... */}

        {/* Visual Flow Diagram */}
        <section className="max-w-7xl mx-auto mb-32 hidden lg:block">
          <div className="relative p-12 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden">
            <h2 className="text-3xl font-bold text-white mb-16 text-center">Design Workflow</h2>
            
            <div className="flex items-center justify-between space-x-4 relative">
              {/* Connection Lines (SVG) */}
              <svg className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 z-0 opacity-20" preserveAspectRatio="none">
                <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="8 8" />
              </svg>

              {[
                { label: "Data Schema", sub: "JSON/SQL Nodes" },
                { label: "Logic Engine", sub: "Visual Workflows" },
                { label: "Edge Context", sub: "Global Runtime" },
                { label: "API Gateway", sub: "REST/GraphQL" }
              ].map((node, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center mb-4 group-hover:border-cyan-500/50 transition-colors shadow-2xl group-hover:shadow-cyan-500/20">
                    <div className="w-6 h-6 rounded-md bg-white/10 group-hover:bg-cyan-500/50 transition-all border border-white/5" />
                  </div>
                  <span className="text-white font-bold text-sm tracking-tight">{node.label}</span>
                  <span className="text-zinc-500 text-[10px] mt-1 font-medium">{node.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Under the Hood Section */}
        <section className="max-w-5xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter mb-4">Under the Hood</h2>
            <p className="text-zinc-500 font-medium">Built for performance and security.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Rust Engine",
                desc: "Our core runtime is written in Rust for sub-millisecond response times.",
                icon: <Cpu className="w-5 h-5 text-red-400" />
              },
              {
                title: "Distributed Nodes",
                desc: "Logic is executed at the edge, ensuring low latency for worldwide users.",
                icon: <Terminal className="w-5 h-5 text-blue-400" />
              },
              {
                title: "Enterprise Security",
                desc: "Built-in protection against SQL injection, XSS, and DDoS attacks.",
                icon: <ShieldCheck className="w-5 h-5 text-green-400" />
              }
            ].map((tech, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm">
                <div className="mb-4">{tech.icon}</div>
                <h4 className="text-lg font-bold text-white mb-2">{tech.title}</h4>
                <p className="text-zinc-400 text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="max-w-7xl mx-auto mb-32 px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter mb-4">Code vs. Postpipe</h2>
            <p className="text-zinc-500 font-medium">Why visual logic wins every time.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-6 text-white font-bold">Feature</th>
                  <th className="p-6 text-zinc-400 font-medium">Traditional Coding</th>
                  <th className="p-6 text-cyan-400 font-bold">Postpipe Studio</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Development Speed", "Weeks to Months", "Days to Weeks"],
                  ["Boilerplate Code", "Thousands of lines", "Zero boilerplate"],
                  ["Security", "Manual implementation", "Native enterprise security"],
                  ["Scalability", "Manual infra management", "Click-to-scale infrastructure"],
                  ["Logic Changes", "Rewrite/Recompile/Redeploy", "Visual node modification"]
                ].map(([feature, trad, studio], i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                    <td className="p-6 text-white font-medium">{feature}</td>
                    <td className="p-6 text-zinc-500">{trad}</td>
                    <td className="p-6 text-zinc-300 font-semibold">{studio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-32 px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter mb-4">Common Questions</h2>
            <p className="text-zinc-500 font-medium">Everything you need to know about our engine.</p>
          </div>

          <div className="space-y-6">
            {[
              { q: "Is Postpipe just a code generator?", a: "No. Unlike other tools that generate static code, Postpipe is a visual logic engine that runs on a high-performance Rust runtime, ensuring your data is handled efficiently and securely." },
              { q: "Can I host this on my own infrastructure?", a: "Currently, Postpipe logic is executed on our globally distributed edge network for maximum performance. Enterprise plans allow for dedicated private cloud instances." },
              { q: "How secure is my data?", a: "Postpipe uses bank-grade encryption at rest and in transit. We are SOC2 compliant and follow strict security protocols across all our distributed nodes." },
              { q: "Do I own the logic I build?", a: "Absolutely. Any logic, data schemas, and API structures you design are 100% yours. You can export your data and logic at any time." }
            ].map((faq, i) => (
              <div key={i} className="p-8 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm group hover:border-white/20 transition-all">
                <div className="flex items-center space-x-4 mb-4">
                  <HelpCircle className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-lg font-bold text-white italic">{faq.q}</h4>
                </div>
                <p className="text-zinc-400 leading-relaxed pl-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="text-center mb-32">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block p-1 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shadow-2xl shadow-blue-500/20"
          >
            <button className="bg-black text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-zinc-950 transition-all">
              Launch your Backend
            </button>
          </motion.div>
        </section>
      </div>
      <Footer />
      <StudioBranding />
    </main>
  );
}
