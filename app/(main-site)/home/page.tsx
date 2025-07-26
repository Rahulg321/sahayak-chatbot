import { auth } from "@/app/(auth)/auth";
import AddGradeDialog from "@/components/dialogs/AddGradeDialog";
import { getAllGradesByUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import React from "react";

const HomePage = async () => {
  const userSession = await auth();

  if (!userSession) {
    redirect("/login");
  }

  const allGrades = await getAllGradesByUser(userSession.user.id);

  return (
    <div className="block-space big-container">
      <div>
        <AddGradeDialog />
      </div>

      <div></div>
    </div>
  );
};

export default HomePage;
