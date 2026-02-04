import clsx from "clsx";
import type { ReactNode, HTMLAttributes } from "react";
import React from "react";

interface Props extends HTMLAttributes<HTMLHeadingElement | HTMLDivElement> {
  level?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  heading?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}

const sizeClass: Record<number, string> = {
  0: "text-base leading-relaxed",
  1: "text-5xl sm:text-6xl leading-[1.1] tracking-tight",
  2: "text-4xl sm:text-5xl leading-[1.2] tracking-tight",
  3: "text-3xl sm:text-4xl leading-snug",
  4: "text-2xl sm:text-3xl leading-snug",
  5: "text-xl sm:text-2xl leading-normal",
  6: "text-lg sm:text-xl leading-normal",
};

const HeadingText = ({
  level = 2,
  heading,
  children,
  className = "",
  ...props
}: Props) => {
  const baseStyles = "font-secondary font-bold";
  const validLevel = (level in sizeClass ? level : 2) as keyof typeof sizeClass;
  const validHeading = (heading ?? level) as keyof typeof sizeClass;
  const size = sizeClass[validLevel];
  const combinedClassName = clsx(baseStyles, size, className);

  const Tag = (validHeading === 0 ? "div" : `h${validHeading}`) as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "div";

  return (
    <Tag className={combinedClassName} {...props}>
      {children}
    </Tag>
  );
};

export default HeadingText;
