import React from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-page relative overflow-hidden px-6 py-12">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full ocean-gradient opacity-20" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-purple/20 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-blue/20 blur-[120px] rounded-full" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="mb-8 text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          OceanExotic Global
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
