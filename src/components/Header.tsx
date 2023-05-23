import { signIn, signOut, useSession } from "next-auth/react";

const Header = () => {
  const { data: sessionData } = useSession();
  return (
    <div>
      <div className="container mx-auto px-6 py-4">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xl">
              <h1 className="text-2xl font-bold text-white lg:text-3xl">
                Spotify GP
              </h1>
            </div>
          </div>

          <div>
            <div className="flex-1 md:flex md:items-center md:justify-between">
              <div className="-mx-4 flex flex-col md:mx-8 md:flex-row md:items-center">
                <button
                  className="bg-white/10 px-6 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                  onClick={
                    sessionData ? () => void signOut() : () => void signIn()
                  }
                >
                  {sessionData ? "Sign out" : "Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
