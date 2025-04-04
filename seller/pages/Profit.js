import { Settings } from "lucide-react";
import ProfitShow from "@/components/ProfitShow";
import Sidebar from "@/components/Sidebar";
import NavBar from "@/components/NavBar";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import Marker_conto from "@/contract/Abi.json";
import { ethers } from "ethers";
import { useInstance } from "@/contract/hooks/useInstance";
import getAddress from "@/hooks/getAddress";

function App() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const address = getAddress();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const contract = await useInstance();
        const count = Number(await contract.productCount());

        const fetchedProducts = [];

        for (let i = 1; i <= count; i++) {
          try {
            const productData = await contract.store(i);
            if (
              productData.seller.toLowerCase() === (await address).toLowerCase()
            ) {
              fetchedProducts.push({
                id: i,
                name: ethers.decodeBytes32String(productData.name),
                price: ethers.formatUnits(productData.price.toString(), 18),
                stock: productData.stock.toString(),
                description: ethers.toUtf8String(productData.description),
                image: ethers.toUtf8String(productData.image),
                productType: ethers.decodeBytes32String(
                  productData.productType
                ),
                condition: ethers.decodeBytes32String(productData.condition),
                seller: productData.seller,
              });
            }
          } catch (error) {
            console.error(`Error fetching product ${i}:`, error);
          }
        }

        const fetchCount = fetchedProducts.length;
        setTotalProducts(fetchCount);

        const TotalSales = fetchedProducts.map((item) => {
          return Number(item.price) * Number(item.stock);
        });

        const random = Math.random();
        const randomNum = Math.floor(random * 100) + 1;
        setTotalSales(randomNum);

        setTotalProfit(TotalSales.reduce((a, b) => a + b, 0));
      } catch (error) {
        console.error("Error connecting to contract:", error);
      }
    };

    fetchProducts();
  }, [address]);
  return (
    <div>
      <NavBar className="h-16 border-b border-gray-800 shadow-lg" />
      <div className="flex flex-col h-screen bg-black text-white">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar className="w-64 border-r border-gray-800" />

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <ProfitShow
                totalProducts={totalProducts}
                totalSales={totalSales}
                totalProfit={totalProfit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
