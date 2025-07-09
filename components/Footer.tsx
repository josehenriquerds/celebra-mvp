import { FOOTER_CONTACT_INFO, FOOTER_LINKS, SOCIALS } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="flexCenter mb-12">
      <div className="padding-container max-container flex w-full flex-col gap-14">
        <div className="flex flex-col items-start justify-center gap-[10%] md:flex-row">
          <Link href="/" className="mb-10">
            <Image src="/logopro.png" alt="Celebre Logo" width={74} height={29} />
          </Link>

          <div className="flex flex-wrap gap-10 sm:justify-between md:flex-1">
            {FOOTER_LINKS.map((columns) => (
              <FooterColumn key={columns.title} title={columns.title}>
                <ul className="regular-14 flex flex-col gap-4 text-gray-30">
                  {columns.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="/"
                        className="hover:text-[#F2B7B6] transition-colors duration-300"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            ))}

            <div className="flex flex-col gap-5">
              <FooterColumn title={FOOTER_CONTACT_INFO.title}>
                <ul className="text-sm space-y-2">
                  {FOOTER_CONTACT_INFO.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href="/"
                        className="flex gap-2 items-center hover:text-[#F2B7B6] transition-colors"
                      >
                        <span>{link.label}:</span>
                        <span >{link.value}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            </div>

            <div className="flex flex-col gap-5">
              <FooterColumn title={SOCIALS.title}>
                <ul className="regular-14 flex gap-4 text-gray-30">
                  {SOCIALS.links.map((link, index) => (
                    <li key={index}>
                      <Link href="/">
                        <Image src={link} alt={`Social ${index}`} width={24} height={24} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p>2025 Celebre | Todos os direitos Reservados</p>
          <p className="flex justify-center items-center gap-1 mt-2">
            Desenvolvido por{" "}
            <span className="text-orange-600 font-semibold hover:text-[#F2B7B6] transition-colors duration-300">
              Ocellaris
            </span>
            <Image
              src="/Ocellaris.svg"
              alt="Ocellaris logo"
              width={24}
              height={24}
              className="ml-1"
            />
          </p>
        </div>
      </div>
    </footer>
  );
};

type FooterColumnProps = {
  title: string;
  children: React.ReactNode;
};

const FooterColumn = ({ title, children }: FooterColumnProps) => {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="bold-18 whitespace-nowrap">{title}</h4>
      {children}
    </div>
  );
};

export default Footer;
