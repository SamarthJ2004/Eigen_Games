"use client";

import { usePrivy } from "@privy-io/react-auth";
import Button from "@/components/common-components/button";

export default function Auth() {
  const { login, logout, user, ready } = usePrivy();

  if (!ready) return <p>Loading...</p>;

  return (
    <div>
      {user ? (
        <div>
          <Button text={"Acc: ..." + user.wallet?.address.slice(38, 42)} />
          <Button onClick={logout} text="Logout" />
        </div>
      ) : (
        <Button onClick={login} text="Login with Privy" />
      )}
    </div>
  );
}
