import React from "react";
import { motion } from "framer-motion";

const experiences = [
  {
    title: "Senior Software Engineer",
    company: "Tech Solutions Inc.",
    period: "2021 - Present",
    description: "Lead development of enterprise applications using React, Node.js, and cloud technologies.",
    color: "border-blue-500",
  },
  {
    title: "Software Developer",
    company: "Digital Innovations",
    period: "2018 - 2021",
    description: "Developed and maintained multiple web applications with a focus on performance and accessibility.",
    color: "border-purple-500",
  },
  {
    title: "Junior Developer",
    company: "StartUp Labs",
    period: "2016 - 2018",
    description: "Built foundational skills in full-stack development while contributing to various projects.",
    color: "border-blue-500",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
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
              About
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-emerald-600 dark:via-emerald-500 to-transparent" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Get to Know Me
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Who I Am */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Who I Am
            </h3>

            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                I'm Adeboye Salisu, a passionate software engineer with over 5 years of 
                experience in building web applications and solving complex problems with code. 
                I specialize in creating efficient, scalable, and user-friendly solutions.
              </p>
              <p>
                My journey in tech started when I was 16, tinkering with HTML and CSS. 
                Since then, I've worked with startups and established companies to bring 
                their digital visions to life.
              </p>
              <p>
                When I'm not coding, you can find me mentoring aspiring developers, 
                contributing to open-source projects, or exploring new technologies.
              </p>
            </div>
          </motion.div>

          {/* My Experience */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              My Experience
            </h3>

            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 6 }}
                  className="relative group bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${exp.color} group-hover:w-2 transition-all duration-300`} />
                  <div className="pl-6 group-hover:pl-7 transition-all duration-300">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                      {exp.company} • {exp.period}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}