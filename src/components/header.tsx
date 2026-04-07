import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[--page-max] px-6 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/maplovin-logo.png"
              alt="MapLovin"
              width={180}
              height={56}
              priority
              className="h-auto w-auto"
            />
          </div>
          <p className="text-sm font-medium text-[var(--ml-gray-base)]">
            Health Check Demo
          </p>
        </div>
      </div>
    </header>
  );
}
