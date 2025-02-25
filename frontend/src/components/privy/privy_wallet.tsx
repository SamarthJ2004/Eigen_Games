import { createPortal } from "react-dom";
import Image from "next/image";
import Button from "../common-components/button";

const CenteredWalletModal = ({
  walletInfo,
  amount,
  setAmount,
  handleFundWallet,
  onClose,
}) => {
  if (!walletInfo) return null;
  console.log(walletInfo)
  const modalContent = (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-lg">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-6">
              <div className="flex flex-col items-center">
                <Image
                  className="mb-3 rounded-full shadow-lg"
                  src="/assets/naruto.jpg"
                  alt="Wallet Avatar"
                  width={200}
                  height={200}
                />
                <h5 className="mb-1 text-2xl font-medium text-gray-900 dark:text-white">
                  Wallet Created Successfully
                </h5>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {walletInfo.walletAddress}
                </span>

                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      setAmount(value);
                    }}
                    placeholder="Enter ETH amount"
                    className="flex-1 px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button onClick={handleFundWallet} text="Fund Wallet"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default CenteredWalletModal;
