import Link from "next/link";

export default function FloatingButton() {
  return (
    <Link
      href="/demandas/new"
      className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 border-2 border-transparent animate-border-pulse text-base md:text-lg">
      Publica gratis tu Necesidad

    </Link>
  );
}
