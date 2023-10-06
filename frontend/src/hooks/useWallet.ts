import { useCallback, useState } from "react";
import { useLocale } from "./useLocale";
import { useRouter } from "next/router";
import { useWeb3WalletConfig } from "src/libs/web3Config";
import { Localhost, Mumbai, Polygon } from "@thirdweb-dev/chains";
import { useConnect } from "@thirdweb-dev/react";

export const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
export const activeChain =
  chainId === "80001"
    ? Mumbai
    : chainId === "137"
    ? Polygon
    : { ...Localhost, chainId: 31337 };

export const useConnectMagic = (email: string) => {
  const { magicLinkConfig } = useWeb3WalletConfig();
  const magic = magicLinkConfig.create({ chain: Mumbai });
  const connect = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const handleConnect = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      await magic.initializeConnector();
      const m = magic.getMagic();
      await m.auth.loginWithEmailOTP({ email });
      connect(magicLinkConfig, {
        email,
        chainId: Number(chainId),
      });
    } catch (e: any) {
      console.log(e);
      setError(e);
    }
    setIsLoading(false);
  }, [email, connect, magicLinkConfig, magic]);

  return { handleConnect, isLoading, error };
};

export const useDeeplink2Metamask = () => {
  const { locale } = useLocale();
  const { asPath } = useRouter();

  const deeplink = useCallback(() => {
    if (!window.ethereum) {
      if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        window.location.href = `https://metamask.app.link/dapp/${
          process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? "" : "staging."
        }mintrally.xyz/${locale}${asPath}`;
      } else {
        window.open("https://metamask.io/", "_blank");
      }
    }
  }, []);

  return deeplink;
};
