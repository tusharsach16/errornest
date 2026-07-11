export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 dark:text-zinc-400 sm:flex-row">
        {/* Copyright */}
        <p>© {year} ErrorNest. All rights reserved.</p>

        {/* Links */}
        <nav aria-label="Footer links" className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-[150ms] ease-out hover:text-ink dark:hover:text-white hover:scale-[1.05] active:scale-[0.97] focus-visible:rounded min-h-[44px] flex items-center motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            GitHub
          </a>
          <span aria-hidden="true" className="text-gray-200 dark:text-zinc-800 select-none">
            |
          </span>
          <span>MIT License</span>
        </nav>
      </div>
    </footer>
  );
}
