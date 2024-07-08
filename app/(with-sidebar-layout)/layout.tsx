import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { NavItem } from "../nav-item";
import { User, HeartFill, DollarSign } from "@geist-ui/icons";

export default function Jaffa({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-black px-6 justify-between w-full">
        <Link
          className="flex items-center gap-2 font-semibold text-white"
          href="/dashboard"
        >
          <span className="">POC APP</span>
        </Link>
        <div className="flex items-center justify-end flex-1 lg:flex-none">
          {/* Additional header content here */}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r bg-gray-100/40 dark:bg-gray-800/40">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                <NavItem href="/profile">
                  <User />
                  Profile
                </NavItem>
                <NavItem href="/Favorites">
                  <HeartFill />
                  Favorites
                </NavItem>
                <NavItem href="/Offers">
                  <DollarSign />
                  Offers
                </NavItem>
              </nav>
            </div>
            <div className="py-2 px-4 text-sm font-medium">
              <AuthButton />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6 overflow-auto">{children}</div>
      </div>
      <footer className="flex items-center justify-center h-14 bg-black text-white">
        <div className="flex gap-4">
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:underline">
            Terms of Use
          </Link>
        </div>
      </footer>
    </div>
  );
}
