"use client";

import Image from "next/image";

export default function Home() {
  return (
    // Removido o min-h-screen do pai para que ele se ajuste ao tamanho da imagem no mobile
    <div className="relative w-full bg-black"> 

      {/* 📱 IMAGEM MOBILE - Ajuste Dinâmico */}
      <div className="block lg:hidden w-full">
        <Image
          src="/background_lu_mobile.png"
          alt="Imagem Mobile"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto" // Mantém a proporção real sem sobras
          priority
        />
      </div>

      {/* 💻 IMAGEM DESKTOP - Mantida com Fill para cobrir a tela toda */}
      <div className="hidden lg:block">
        <div className="relative h-screen w-full">
          <Image
            src="/background_lu.png"
            alt="Background Desktop"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
