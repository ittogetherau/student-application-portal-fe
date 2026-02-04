import React from "react";

interface Props extends React.HtmlHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
const SpacingLayout = ({ children, className, ...props }: Props) => {
  const classes = `${className} md:space-y-22 md:mb-22 space-y-16 mb-16`;
  return (
    <div {...props} className={classes}>
      {children}
    </div>
  );
};

export default SpacingLayout;
