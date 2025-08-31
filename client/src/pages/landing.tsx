import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to CryptoCasino</h1>
      <p className="mb-8">
        The ultimate online gaming experience.
      </p>
      <div className="space-x-4">
        <Link href="/login">
          <a className="px-6 py-3 bg-indigo-600 rounded-md font-semibold hover:bg-indigo-700">
            Login
          </a>
        </Link>
        <Link href="/signup">
          <a className="px-6 py-3 bg-gray-700 rounded-md font-semibold hover:bg-gray-600">
            Sign Up
          </a>
        </Link>
      </div>
    </div>
  );
}
