'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 px-6 md:px-12">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <p className="text-gray-600">© {new Date().getFullYear()} Celebre. Todos os direitos reservados.</p>
        <div className="space-x-4">
          {['Sobre', 'Termos', 'Privacidade', 'Contato'].map(link => (
            <Link key={link} href={`/${link.toLowerCase()}`} className="text-gray-600 hover:text-[#863F44]">
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}