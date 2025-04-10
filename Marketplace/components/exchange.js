"use client";

import GetSlug from "@/services/getslug";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Loader2, Gem, ShoppingBag, Wallet } from "lucide-react";
import { useContract } from "@/services/useContract";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function ExchangeComp() {
  const { address } = useAccount();
  const [nftData, setNftData] = useState({ listedNFTs: [], ownerNFTs: [] });
  const [loading, setIsLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeContract = async () => {
    try {
      const contractFunctions = await useContract();
      setContract(contractFunctions);
    } catch (err) {
      console.error("Contract initialization error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function fetchNFTs() {
      if (!address) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const slugData = await GetSlug(address);
        if (slugData?.collections) {
          const seenNFTs = new Set();
          let allListedNFTs = [];
          let allOwnerNFTs = [];

          slugData.collections.forEach((collection) => {
            const { ownerNFTs = [], listedNFTs = [] } = collection.data || {};

            listedNFTs.forEach((nft) => {
              const key = `${nft.contract_address}-${nft.identifier}`;
              if (!seenNFTs.has(key)) {
                seenNFTs.add(key);
                allListedNFTs.push({
                  ...nft,
                  uniqueKey: `listed-${nft.order_hash || nft.identifier}-${
                    nft.contract_address || ""
                  }-${Math.random().toString(36)}`,
                  price: nft.price ? ethers.formatEther(nft.price) : null,
                  currency: nft.currency || "ETH",
                });
              }
            });

            ownerNFTs.forEach((nft) => {
              const key = `${nft.contract_address}-${nft.identifier}`;
              if (!seenNFTs.has(key)) {
                seenNFTs.add(key);
                allOwnerNFTs.push({
                  ...nft,
                  uniqueKey: `owned-${nft.identifier}-${
                    nft.contract_address || ""
                  }-${Math.random().toString(36).substr(2, 9)}`,
                  price: null,
                  currency: null,
                });
              }
            });
          });

          setNftData({
            listedNFTs: allListedNFTs,
            ownerNFTs: allOwnerNFTs,
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    initializeContract();
    fetchNFTs();
  }, [address]);

  const handleNFTTransfer = async (nft) => {
    if (!contract || !address || !nft.price) {
      setError("Only listed NFTs can be exchanged");
      return;
    }

    setTransferLoading(true);
    setError(null);

    try {
      const tokenId = parseInt(nft.identifier);
      const nftContractAddress = nft.contract_address;

      const brtxAmount = nft.price ? nft.price.toString() : "1";

      const tx = await contract.NameTransfer(
        nftContractAddress,
        tokenId,
        brtxAmount
      );

      const slugData = await GetSlug(address);
      if (slugData?.collections) {
        const seenNFTs = new Set();
        let allListedNFTs = [];
        let allOwnerNFTs = [];

        slugData.collections.forEach((collection) => {
          const { ownerNFTs = [], listedNFTs = [] } = collection.data || {};

          listedNFTs.forEach((nft) => {
            const key = `${nft.contract_address}-${nft.identifier}`;
            if (!seenNFTs.has(key)) {
              seenNFTs.add(key);
              allListedNFTs.push({
                ...nft,
                price: nft.price ? ethers.formatEther(nft.price) : null,
                currency: nft.currency || "ETH",
              });
            }
          });

          ownerNFTs.forEach((nft) => {
            const key = `${nft.contract_address}-${nft.identifier}`;
            if (!seenNFTs.has(key)) {
              seenNFTs.add(key);
              allOwnerNFTs.push({
                ...nft,
                price: null,
                currency: null,
              });
            }
          });
        });

        setNftData({
          listedNFTs: allListedNFTs,
          ownerNFTs: allOwnerNFTs,
        });
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setError(
        error.message.includes("user rejected")
          ? "Transaction was cancelled"
          : "Transfer failed. See console for details."
      );
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-lime-500" />
        <p className="mt-4 text-lg text-gray-300">Loading your NFTs...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Wallet className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-xl text-gray-300">
          Connect your wallet to view NFTs
        </p>
        <div className="mt-4">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (nftData.listedNFTs.length === 0 && nftData.ownerNFTs.length === 0) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center min-h-screen">
        <Gem className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-xl text-gray-300">
          No NFTs found in your wallet
        </p>
        <Link href="/profile" className="p-3 bg-lime-500 rounded-md">
          add slug to get nfts
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg">
            Error: {error}
          </div>
        )}

        {transferLoading && (
          <div className="mb-6 p-4 bg-blue-900/50 text-blue-200 rounded-lg flex items-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing NFT transfer...
          </div>
        )}

        <div className="space-y-8">
          {nftData.listedNFTs.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center mb-4">
                <ShoppingBag className="w-5 h-5 text-lime-500 mr-2" />
                <h2 className="text-xl font-medium text-white">
                  Listed NFTs ({nftData.listedNFTs.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nftData.listedNFTs.map((nft) => (
                  <NFTCard
                    key={nft.uniqueKey}
                    nft={nft}
                    type="listed"
                    onClick={() => handleNFTTransfer(nft)}
                  />
                ))}
              </div>
            </div>
          )}

          {nftData.ownerNFTs.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center mb-4">
                <Wallet className="w-5 h-5 text-lime-500 mr-2" />
                <h2 className="text-xl font-medium text-white">
                  Owned NFTs ({nftData.ownerNFTs.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nftData.ownerNFTs.map((nft) => (
                  <NFTCard
                    key={nft.uniqueKey}
                    nft={nft}
                    type="owned"
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NFTCard({ nft, type, onClick }) {
  return (
    <div
      className={`group bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 relative ${
        type === "listed"
          ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
          : "opacity-80 cursor-not-allowed"
      }`}
      onClick={type === "listed" ? onClick : undefined}
    >
      <div className="relative pb-[100%] bg-gray-700 overflow-hidden">
        {nft.image_url ? (
          <img
            src={nft.image_url}
            alt={nft.name}
            className="absolute h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x400/1e293b/9ca3af?text=NFT";
            }}
          />
        ) : (
          <div className="absolute h-full w-full flex items-center justify-center bg-gray-700">
            <Gem className="w-12 h-12 text-gray-500 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-medium truncate">
          {nft.name || "Unnamed NFT"}
        </h3>
        <p className="text-gray-400 text-sm mt-1 truncate">
          {nft.description || "No description"}
        </p>
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              type === "owned"
                ? "bg-lime-500 text-black"
                : "bg-blue-900 text-blue-300"
            }`}
          >
            {type === "owned" ? "OWNED" : "LISTED"}
          </span>
          {type === "listed" && nft.price && (
            <span className="text-white font-medium">
              {nft.price}
              {nft.currency === "0x0000000000000000000000000000000000000000"
                ? "ETH"
                : "N/A"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
