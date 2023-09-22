import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'antd/dist/antd.css';
import type { AppProps } from 'next/app';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { Provider } from 'react-redux';
import store from '../stores';
// import { Silkscreen } from '@next/font/google'

const { chains, provider, webSocketProvider } = configureChains(
  [
    // chain.mainnet,
    // chain.polygon,
    // chain.optimism,
    // chain.arbitrum,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
      ? [chain.polygonMumbai]
      : [chain.polygonMumbai]),
  ],
  [
    alchemyProvider({
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: 'rRqZllyk7wfMAjruk4EP2qcP8j7-QtV_',
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Hackmon',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

// const silkscreen = Silkscreen({
//   weight: '400',
// })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
