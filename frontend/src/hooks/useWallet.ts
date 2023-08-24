import { useCallback } from "react";
import { useLocale } from "./useLocale";
import { useRouter } from "next/router";

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
