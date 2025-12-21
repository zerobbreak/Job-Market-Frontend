import { contributors, stack } from "../../constants/constants";
import { Users, Cpu } from "lucide-react";

export const ProjectInfo = () => {
  return (
    <section className="py-32 border-t border-white/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Tech Stack */}
        <div className="mb-32">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-300 mb-6">
              <Cpu className="h-4 w-4" />
              <span>Technology Stack</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Powered by Modern Tech
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Built with cutting-edge technologies for performance, scalability,
              and developer experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {stack.map((item, index) => (
              <div
                key={item.name}
                className="group relative animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 ${item.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                ></div>

                {/* Card */}
                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Icon Container */}
                  <div className="mb-4 relative">
                    <div
                      className={`w-16 h-16 rounded-xl bg-linear-to-br ${item.color} p-0.5 mx-auto`}
                    >
                      <div className="w-full h-full rounded-xl bg-[#0A0F1C] flex items-center justify-center">
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    {/* Floating particles */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                  </div>

                  {/* Text */}
                  <div className="text-center">
                    <span className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors */}
        <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-6">
              <Users className="h-4 w-4" />
              <span>Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              Meet the Contributors
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Built with passion by dedicated developers committed to
              revolutionizing job hunting
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {contributors.map((contributor, index) => (
              <div
                key={contributor.name}
                className="group relative animate-slide-up"
                style={{ animationDelay: `${700 + index * 100}ms` }}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-linear-to-r ${contributor.gradient} rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                ></div>

                {/* Card */}
                <div className="relative bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl min-w-[280px]">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className={`w-20 h-20 rounded-full bg-linear-to-br ${contributor.gradient} flex items-center justify-center text-2xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {contributor.avatar}
                    </div>
                    <h3 className="font-bold text-xl text-white mb-1">
                      {contributor.name}
                    </h3>
                    <p className="text-sm text-blue-300 font-medium">
                      {contributor.role}
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3">
                    <a
                      href={contributor.github}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all hover:scale-110"
                      aria-label="GitHub"
                    >
                      Github
                    </a>
                    <a
                      href={contributor.linkedin}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all hover:scale-110"
                      aria-label="LinkedIn"
                    >
                      {/* <Linkedin className="w-5 h-5 text-gray-400 hover:text-white transition-colors" /> */}
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
