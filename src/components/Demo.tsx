import { motion } from "framer-motion";

export function Demo() {
  return (
    <section id="demo" className="relative py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-white font-black tracking-tighter"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1 }}
          >
            Experience the <span className="italic">Future.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-xl text-white/80 font-medium max-w-2xl mx-auto"
          >
            Watch how Clouds transforms business creativity at scale.
          </motion.p>
        </div>

        {/* Video Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-video w-full max-w-5xl mx-auto rounded-[2.5rem] border border-white/30 bg-white/10 backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          <div className="absolute inset-0">
            <iframe 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Cloudz AI Demo"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Once video is provided, it will be placed here */}
          {/* <video src={videoSource} controls className="h-full w-full object-cover" /> */}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-white/10 blur-[120px]" />
      </div>
    </section>
  );
}
