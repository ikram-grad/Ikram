export function Footer() {
  return (
    <footer className="py-24 px-8 md:px-16 bg-[var(--black)]">
      <div className="max-w-[2000px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-md">
            <h3 className="text-6xl md:text-7xl tracking-tighter mb-6 text-[#C88D00]">
              IKRAM
            </h3>
            <p className="text-neutral-400 text-sm">
              Rescuing premium food from waste, one meal at a time.
            </p>
          </div>

          <div className="flex gap-24">
            <div>
              <h4 className="text-xl tracking-widest uppercase mb-4 text-[var(--orange)]">
                Platform
              </h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="hover:text-[var(--orange)] cursor-pointer transition-colors">
                  How it works
                </li>
                <li className="hover:text-[var(--orange)] cursor-pointer transition-colors">
                  For restaurants
                </li>
                <li className="hover:text-[var(--orange)] cursor-pointer transition-colors">
                  For consumers
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl tracking-widest uppercase mb-4 text-[#C88D00]">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="hover:text-[var(--orange)] cursor-pointer transition-colors">
                  About us
                </li>
                <li className="hover:text-[var(--orange)] cursor-pointer transition-colors">
                  Impact report
                </li>
                <li className="hover:text-[var(--orange)] cursor-pointer transition-colors">
                  Contact
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-neutral-800 text-sm text-neutral-500">
          © 2025 Ikram. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
