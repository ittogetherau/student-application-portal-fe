import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div>
      <Link href={"/login"}>
        <Button>Login</Button>
      </Link>
    </div>
  );
};

export default Page;
