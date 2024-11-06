import PatientForm from "@/components/forms/PatientForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return(
    <div className="flex h-screen max-h-screen">
   <section className="remove-scrollbar container my-auto">
    <div className="sub-container max-w-[496px]">
      <Image
      src="/assets/icons/logo-full.svg"
      height={1000}
      width={1000}
      alt="logo"
      className="mb-12 h-10 w-fit"
      />
      <PatientForm/>
      <div className="text-14-regular mt-20 flex justify-betweem">
        <p className="justify-items-end text-dark-600 xl:text-left">
           © 2024 MediSchedule
        </p>
        </div>
    </div>
   </section>
    </div>
  )
}
