import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[--page-max] px-6 py-4 md:px-8">
        <div className="flex items-center justify-center">
          <Image
            src="/maplovin-logo-circle.avif"
            alt="MapLovin"
            width={40}
            height={40}
            priority
            className="h-10 w-10"
          />
        </div>
      </div>
    </header>
  );
}
