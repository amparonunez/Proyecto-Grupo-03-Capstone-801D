import Image from "next/image";
export default function ConfirmacionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center text-white bg-black">
        <Image
                  src="/img/Mamba logo render.png"
                  alt="Mamba Logo"
                  width={120}
                  height={120}
                />
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">¡Cuenta confirmada!</h1>
      <p>Tu correo se cambio con exito!!. Ya puedes iniciar sesión en Mamba Club.</p>
    </div>
  );
}
