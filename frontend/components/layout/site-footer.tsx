export function SiteFooter() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} EDUCART. All rights reserved.</p>
        <nav className="flex items-center gap-6">
          <a href="/privacy" className="hover:text-foreground transition">Privacy</a>
          <a href="/terms" className="hover:text-foreground transition">Terms</a>
          <a href="/contact" className="hover:text-foreground transition">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
