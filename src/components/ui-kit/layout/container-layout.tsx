import React, { type ReactNode } from "react";

export interface Props {
  size?: "sm" | "md" | "base" | "lg";
  isCenter?: boolean;
  pad?: boolean;
  className?: string;
  children: ReactNode;
}

const ContainerLayout: React.FC<Props> = ({
  size = "container-lg",
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
          : size === "lg"
            ? "container-lg"
            : "container"
    } ${isCenter ? "mx-auto" : ""} ${pad ? "px-4" : ""} ${className} `}
  >
    {children}
  </div>
);

export default ContainerLayout;
