import { Link } from "@inertiajs/react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 text-center text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-4">Powered by Laravel, React, and Inertia.js</p>
        <div className="flex justify-center space-x-4">
          <Link href="#" className="transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Terms of Service
          </Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} MockMate. All rights reserved.</p>
      </div>
    </footer>
  );
}
