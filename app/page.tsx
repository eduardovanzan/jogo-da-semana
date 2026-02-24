"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">

      {/* 📱 IMAGEM MOBILE */}
      <Image
        src="/background_lu_mobile.png"
        alt="Background Mobile"
        fill
        priority
        className="object-cover lg:hidden"
      />

      {/* 💻 IMAGEM DESKTOP */}
      <Image
        src="/background_lu.png"
        alt="Background Desktop"
        fill
        priority
        className="hidden lg:block object-cover"
      />

      {/* Overlay opcional */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Conteúdo */}
      <div className="relative z-10 min-h-screen flex items-center justify-center text-white">
        {/* conteúdo aqui */}
      </div>

    </div>
  );
}