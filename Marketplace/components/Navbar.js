"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CoinsIcon, UserRoundIcon } from "lucide-react";
import Image from "next/image";
import erc_conto from "@/contract/Erc20.json";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formattedBalance, setFormattedBalance] = useState(0);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || !isConnected) {
        setFormattedBalance("0");
        return;
      }

      try {
        if (!window.ethereum) {
          throw new Error("Ethereum provider not found");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          erc_conto.address,
          erc_conto.abi,
          signer
        );

        const balance = await contract.balanceOf(address);
        const formatted = ethers.formatUnits(balance, 18);

        setFormattedBalance(Number(formatted).toFixed(4));
      } catch (err) {
        setFormattedBalance("0");
      }
    };

    fetchBalance();
  }, [address, isConnected]);

  return (
    <header className="p-4 bg-black text-white shadow-lg">
      <div className="container flex justify-between h-16 mx-auto">
        <div className="flex items-center">
          <Link
            rel="noopener noreferrer"
            href="/"
            aria-label="Back to homepage"
            className="flex items-center p-2"
          >
            <Image
              src="/Logojpg.png"
              alt="logo"
              width={100}
              height={100}
              className="ml-10 cursor-pointer"
            />
          </Link>

          <ul className="items-stretch hidden space-x-3 lg:flex ml-6">
            <li className="flex">
              <Link
                rel="noopener noreferrer"
                href="/"
                className="flex items-center px-4 -mb-1 border-b-2 font-mono border-transparent hover:border-lime-500 hover:text-lime-500 transition-colors duration-300"
              >
                Products.
              </Link>
            </li>

            <li className="flex">
              <Link
                rel="noopener noreferrer"
                href="/nftmarketplace"
                className="flex items-center px-4 -mb-1 border-b-2 font-mono border-transparent hover:border-lime-500 hover:text-lime-500 transition-colors duration-300"
              >
                NFTs.
              </Link>
            </li>

            <li className="flex">
              <Link
                rel="noopener noreferrer"
                href="/exchange"
                className="flex items-center px-4 -mb-1 border-b-2 font-mono border-transparent hover:border-lime-500 hover:text-lime-500 transition-colors duration-300"
              >
                Exchange.
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-4">
          <div className="items-center flex-shrink-0 hidden lg:flex gap-4">
            <Link
              href="/profile"
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Profile"
            >
              <UserRoundIcon className="w-5 h-5 text-white hover:text-lime-500" />
            </Link>
            <h1 className="flex items-center text-white font-mono">
              <Image src="/BarterxCoin.png" alt="logo" width={30} height={30} />
              {formattedBalance} BRTX
            </h1>
            <ConnectButton />
          </div>

          <button
            className="p-2 lg:hidden hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-800/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            <Link
              href="/"
              className="py-3 px-4 border-b border-gray-700 text-white hover:bg-gray-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>

            <Link
              href="/nftmarketplace"
              className="py-3 px-4 border-b border-gray-700 text-white hover:bg-gray-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              NFTs
            </Link>
            <Link
              href="/exchange"
              className="py-3 px-4 border-b border-gray-700 text-white hover:bg-gray-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Exchange
            </Link>
            <Link
              href="/profile"
              className="py-3 px-4 border-b border-gray-700 text-white hover:bg-gray-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="py-3 px-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
