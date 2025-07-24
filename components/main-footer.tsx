import React from "react";
import { ModeToggle } from "./mode-toggle";

const MainFooter = () => {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
        <ModeToggle />
      </div>
    </footer>
  );
};

export default MainFooter;
