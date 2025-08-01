import Link from "next/link";
import Profile from "./Profile";
import { ThemeToggleButton } from "./ThemeToggleButton";

export default function Appbar() {
    return (
        <header className="w-full p-1 mt-3 max-sm:mt-7 rounded-lg px-8 max-sm:px-4">
            <nav className="w-full flex items-center justify-between">
                <h1>
                    <Link href="/" className={`font-extrabold text-xl max-sm:text-lg tracking-tight`}>
                        QuizGPT
                    </Link>
                </h1>

                <div className="flex items-center gap-4">
                    <ThemeToggleButton />
                    <Profile />
                </div>
            </nav>
        </header>
    )
}