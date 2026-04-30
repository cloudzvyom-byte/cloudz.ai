const cols = [
  { title: "Product", links: ["Library"] },
  { title: "Company", links: ["About", "Contact"] },
  { title: "Resources", links: ["Docs"] },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white text-black">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full sky-gradient" />
            <span className="text-lg font-bold tracking-tight text-black">Operon</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-gray-600">
            The creative OS for modern brands. Built quietly, in the open.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-black">
              {c.title}
            </h4>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-gray-500 transition hover:text-black">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Operon AI Inc.</span>
          <div className="flex gap-5">
            <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-black transition-colors">Terms</a>
            <a href="/security" className="hover:text-black transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
