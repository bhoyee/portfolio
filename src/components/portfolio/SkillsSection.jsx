import React from "react";
import { motion } from "framer-motion";
import { Code2, Database, Cloud, Wrench, Shield } from "lucide-react";

const skillGroups = [
  {
    title: "Frontend",
    icon: Code2,
    color: "from-blue-500 to-blue-600",
    skills: ["React", "Angular", "TypeScript", "Next.js", "Tailwind CSS", "Redux"],
  },
  {
    title: "Backend",
    icon: Database,
    color: "from-emerald-500 to-emerald-600",
    skills: ["Node.js", ".NET", ".NET Web API", "Python", "FastAPI", "PostgreSQL", "SQL Server", "MongoDB"],
  },
  {
    title: "DevOps",
    icon: Cloud,
    color: "from-purple-500 to-purple-600",
    skills: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform"],
  },
  {
    title: "Tools",
    icon: Wrench,
    color: "from-orange-500 to-orange-600",
    skills: ["Git", "GitHub Actions", "CI/CD", "Linux", "Nginx", "Redis"],
  },
  {
    title: "Security",
    icon: Shield,
    color: "from-red-500 to-red-600",
    skills: ["OWASP", "JWT", "OAuth 2.0", "SSL/TLS", "Penetration Testing", "SAST", "Vulnerability Scanning"],
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24 sm:py-32 bg-white dark:bg-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/20 via-white to-white dark:from-emerald-900/20 dark:via-slate-900 dark:to-slate-900" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-emerald-600 dark:via-emerald-500 to-transparent" />
            <p className="text-sm font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Tech Stack
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-emerald-600 dark:via-emerald-500 to-transparent" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Skills & Expertise
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Technologies I use to build production-ready applications
          </p>
        </motion.div>

        {/* Desktop layout: keep cards readable (avoid ultra-narrow 5-column grid) */}
        <div data-testid="skills-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {skillGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`relative group ${group.title === "Security" ? "lg:col-span-2" : ""}`}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition duration-500" />
              
              <div className="relative bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex items-start gap-4 mb-4">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${group.color} shadow-lg`}
                  >
                    <group.icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {group.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {group.skills.length} technologies
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 relative z-10">
                  {group.skills.map((skill, idx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + idx * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="text-sm text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:shadow-md transition-all duration-200 backdrop-blur-xl cursor-pointer"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
