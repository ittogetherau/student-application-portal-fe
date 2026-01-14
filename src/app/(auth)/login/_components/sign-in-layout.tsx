import Image from "next/image";
import React from "react";

const SignInLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen overflow-hidden grid md:grid-cols-12">
      <div className="hidden md:block md:col-span-6 lg:col-span-7 border-r border-border/20 relative">
        {/* <Image
          alt="Students studying together"
          loading="lazy"
          width={1000}
          height={1000}
          className="w-full h-full object-cover"
          src={"/images/hero-image.webp"}
        /> */}
        <video
          src={
            "https://cms.churchill.edu.au/assets/a21094f6-fe55-4ff2-907b-6e0b09f2256f/hero-video.mp4"
          }
          width={1920}
          height={1080}
          autoPlay
          muted
          playsInline
          loop
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-primary/15" />
      </div>

      <div className="md:col-span-6 lg:col-span-5 grid place-items-center w-full">
        {children}
      </div>
    </div>
  );
};

export default SignInLayout;
