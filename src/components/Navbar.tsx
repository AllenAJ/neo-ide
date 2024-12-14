"use client";
// import { button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SetStateAction, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Input } from "./ui/input";
// import { Connectbutton } from "@rainbow-me/rainbowkit";

export default function Navbar() {

  const [toggle, setToggle] = useState(false)



  return (
    <div className="flex h-[3.5rem]  z-[20]   w-full text-white bg-gray-800 items-center justify-between  fixed top-0 px-2 py-2">
      <Link className="flex gap-4 items-center  " href="/">
        <Image src="/logo.png" height={100} width={40} alt="morph logo" />

        <div className={"text-2xl self font-bold text-white"}>MantleIDE</div>
      </Link>
      
      <div className="flex justify-center items-center h-[3.4rem] rounded-md  gap-8">
        <div>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
