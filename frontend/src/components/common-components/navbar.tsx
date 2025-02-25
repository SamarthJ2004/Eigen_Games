import Icon from "@/assets/logo.jpg";
import Link from "next/link";
import Image from "next/image";
import Auth from "@/auth/auth";
import { CircleUserRound } from "lucide-react";
import Button from "./button";


interface NavbarProps {
  user: {
    wallet?: {
      address: string;
    };
  } | null;
  display: boolean;
  logout: () => void;
  setDisplay: (display: boolean) => void;
}


const Navbar: React.FC<NavbarProps> = ({ user, display, logout, setDisplay }) => {
  return (
    <nav className="py-3 px-5 shadow-md fixed top-0 left-0 w-full z-10 h-[4.5 rem] backdrop-blur-2xl z-100">
      <div className="flex items-center w-full px-4 justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src={Icon} alt="logo" width={35} height={35} />
            <h1 className="text-3xl font-bold text-gray-800">Kalesh</h1>
          </Link>
        </div>
        <div className="w-[30%]">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-6 py-2 rounded-full focus:outline-none text-black bg-slate-100"
          />
        </div>
        <div className="flex">
          {!user ? (
            <div className="text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              <Auth />
            </div>
          ) : (
            <div className="flex gap-2 justify-center items-center">
              {display && (
                <div className="flex gap-2">
                  <Button
                    text={"Acc: ..." + user.wallet?.address.slice(38, 42)}
                    onClick={() => {}}
                  />
                  <Button text="Logout" onClick={logout} />
                </div>
              )}
              <Link
                href="/room"
                className="text-white bg-green-500 rounded-xl px-4 py-2"
              >
                Create Room
              </Link>
              <CircleUserRound
                size={34}
                onClick={() => setDisplay(!display)}
                className="text-black cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
