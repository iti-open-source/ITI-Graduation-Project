import { motion } from "framer-motion";
import { Code2, MessageSquare, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center py-24 px-25 bg-white dark:bg-black"
    >
      <div className="mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Images */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
  {/* Left Column: Single Large Image */}
  <motion.img
    src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/4AtCUbG4jgt14YATdUiwDX/1ec93ac986047bc6ec033aec901acbb7/GettyImages-1463681237.jpg?w=1500&h=680&q=60&fit=fill&f=faces&fm=jpg&fl=progressive&auto=format%2Ccompress&dpr=1&w=1000"
    alt="Candidate practicing interview"
    className="rounded-2xl shadow-xl object-cover w-full h-[520px]"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
  />

  {/* Right Column: Two stacked images */}
  <div className="flex flex-col gap-6">
    <motion.img
      src="https://miro.medium.com/v2/resize:fit:1100/format:webp/1*pKm2J34Yhv7XWKcQUr_fmA.jpeg"
      alt="Live coding session"
      className="rounded-2xl shadow-xl object-cover w-full h-[250px]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    />
    <motion.img
      src="https://dersyb7nfifdf.cloudfront.net/dev/2146/9e1cb418-9ec3-4c7f-aad4-5e879b3500c3.png"
      alt="Performance analytics dashboard"
      className="rounded-2xl shadow-xl object-cover w-full h-[250px]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9 }}
    />
  </div>

  {/* Optional Circular Badge */}
  {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <div className="w-32 h-32 px-2 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl text-white font-bold text-center text-xs sm:text-sm tracking-tight leading-tight">
      Practice <br /> Anytime, Anywhere
    </div>
  </div> */}
</div>



         <div>
         
          <div className="flex items-center gap-2 mb-4">
            <img src="/apple-touch-icon.png" alt="Logo" className="w-6 h-6" />
            <span className="text-primary font-semibold uppercase tracking-wider">
              About MockMate
            </span>
          </div>

        
          <motion.h2
            className="text-3xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            Master your{" "}
            
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                        Interview Skills with Confidence
                    </span>
                
          </motion.h2>

         
          <motion.p
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            MockMate is your all-in-one platform for interview mastery. Create or join live mock sessions 
            tailored to your chosen topics, practice{" "}
            <strong>real-time coding challenges</strong>, and receive{" "}
            <strong>AI-driven feedback</strong> on technical and behavioral skills. 
            Track your growth with a sleek dashboard and actionable insights that help you excel at every stage.
          </motion.p>

         
          <motion.div
            className="mt-8 p-6 rounded-2xl  text-white shadow-lg"
            style={{ background: "linear-gradient(90deg, rgba(88,98,214,0.98) 0%, rgba(36,193,218,0.98) 100%)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
          >
            <h3 className="text-lg font-bold">Simulate Real Interviews</h3>
            <p className="text-sm opacity-95 mt-2">
              Experience both technical and behavioral interviews in a realistic, interactive setting. 
              Get instant feedback and track your improvement over time.
            </p>
          </motion.div>

         
          <div className="mt-8 space-y-5">
            <div className="flex items-center gap-3">
              <Code2 className="text-blue-500" />
              <span className="text-gray-800 dark:text-gray-200">
                Live coding sessions 
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="text-blue-500" />
              <span className="text-gray-800 dark:text-gray-200">
                Personalized behavioral feedback
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-500" />
              <span className="text-gray-800 dark:text-gray-200">
                Dashboard analytics to track performance 
              </span>
            </div>
            {/* <div className="flex items-center gap-3">
              <UserCheck className="text-blue-500" />
              <span className="text-gray-800 dark:text-gray-200">
                Tailored improvement plans to match your career goals
              </span>
            </div> */}
          </div>

          {/* CTA */}
          {/* <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              🎯 Start improving today
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded-xl px-8 py-6 text-lg font-medium"
            >
              Try a Mock Interview →
            </Button>
          </div> */}
        </div>
      </div>
    </section>
  );
}
