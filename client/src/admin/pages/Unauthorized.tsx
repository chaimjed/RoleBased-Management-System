import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Access denied
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        You don't have permission to view this page.
      </p>
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        Back to home
      </Link>
    </div>
  );
}