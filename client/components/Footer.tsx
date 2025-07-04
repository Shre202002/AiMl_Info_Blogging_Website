import { Link } from "react-router-dom";
import { Brain, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "AI & ML": [
      { name: "Deep Learning", href: "/blogs?tag=Deep Learning" },
      { name: "Neural Networks", href: "/blogs?tag=Neural Networks" },
      { name: "Computer Vision", href: "/blogs?tag=Computer Vision" },
      { name: "Natural Language Processing", href: "/blogs?tag=NLP" },
      {
        name: "Reinforcement Learning",
        href: "/blogs?tag=Reinforcement Learning",
      },
    ],
    Resources: [
      { name: "All Articles", href: "/blogs" },
      { name: "Featured Posts", href: "/blogs?featured=true" },
      { name: "Latest Research", href: "/blogs?sort=latest" },
      { name: "Tutorials", href: "/blogs?tag=Tutorial" },
      { name: "Case Studies", href: "/blogs?tag=Case Study" },
    ],
    Community: [
      { name: "About Us", href: "/about" },
      { name: "Contributors", href: "/contributors" },
      { name: "Newsletter", href: "/newsletter" },
      { name: "Contact", href: "/contact" },
      { name: "Submit Article", href: "/submit" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Content Guidelines", href: "/guidelines" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/aimlinfo" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/company/aimlinfo",
    },
    { name: "GitHub", icon: Github, href: "https://github.com/aimlinfo" },
    { name: "Email", icon: Mail, href: "mailto:contact@aimlinfo.com" },
  ];

  return (
    <footer className="bg-muted/20 border-t">
      <div className="container py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-4 text-center sm:text-left">
            <Link
              to="/"
              className="flex items-center justify-center sm:justify-start space-x-2 group"
            >
              <div className="relative">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary group-hover:text-primary/80 transition-colors" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AIML Info
              </span>
            </Link>

            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base max-w-xs sm:max-w-md mx-auto sm:mx-0">
              Your trusted source for artificial intelligence and machine
              learning insights. Discover the latest research, tutorials, and
              breakthrough innovations in AI technology.
            </p>

            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links - 2 columns on mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div
                key={category}
                className="space-y-3 sm:space-y-4 text-center sm:text-left"
              >
                <h4 className="font-semibold text-foreground text-sm sm:text-base">
                  {category}
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {links.slice(0, 4).map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200 text-xs sm:text-sm hover:underline block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background border">
          <div className="max-w-sm sm:max-w-md mx-auto sm:mx-0 space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="font-semibold text-base sm:text-lg">Stay Updated</h4>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Get the latest AI & ML insights delivered to your inbox weekly.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors duration-200 hover:scale-105 whitespace-nowrap w-full sm:w-auto">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start space-x-1 text-xs sm:text-sm text-muted-foreground">
              <span>© {currentYear} AIML Info.</span>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-current" />
                <span>for the AI community.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
              <Link
                to="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-primary transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
