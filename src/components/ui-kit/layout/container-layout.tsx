import React, { type ReactNode } from "react";

export interface Props {
  size?: "sm" | "md" | "base";
  isCenter?: boolean;
  pad?: boolean;
  className?: string;
  children: ReactNode;
}

const ContainerLayout: React.FC<Props> = ({
  size = "base",
  isCenter = true,
  children,
  pad = true,
  className,
}) => (
  <div
    className={`${
      size === "sm"
        ? "container-sm"
        : size === "md"
          ? "container-md"
          : "container"
    } ${isCenter ? "mx-auto" : ""} ${pad ? "px-4" : ""} ${className} `}
  >
    {children}
  </div>
);

export default ContainerLayout;
