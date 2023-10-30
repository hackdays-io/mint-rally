import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body style={{ "--w3m-z-index": 1500, "--wcm-z-index": 1500 } as any}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
