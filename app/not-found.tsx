import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-bold">404: Not Found</h2>
      <p className="mb-6 text-lg">Could not find the requested resource</p>
      Return to{" "}
      <Link
        className="font-semibold text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
        href="/"
      >
        Dashboard
      </Link>
    </div>
  );
}
