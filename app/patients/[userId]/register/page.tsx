import RegisterForm from '@/components/forms/RegisterForm';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Register = async ({ params: { userId } }: SearchParamProps) => {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <Header />
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <section className="mb-12 space-y-4">
            <h1 className="header">Welcome 👋</h1>
            <p className="text-dark-700">Let us know more about yourself.</p>
          </section>
          <RegisterForm />
          <div className="text-14-regular mt-20 flex justify-between">
            <p className="copyright py-12">© 2024 MediSchedule</p>
          </div>
        </div>
      </section>
      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="register-photo"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default Register;
