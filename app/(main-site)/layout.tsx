import React from "react";
import { auth } from "../(auth)/auth";
import { redirect } from "next/navigation";
import MainHeader from "@/components/main-header";
import MainFooter from "@/components/main-footer";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  return (
    <div>
      <MainHeader session={session} />
      {children}
      <MainFooter />
    </div>
  );
};

export default layout;
