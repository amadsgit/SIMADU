import '@/app/ui/global.css';
import { Toaster } from 'react-hot-toast';
import 'react-confirm-alert/src/react-confirm-alert.css';
import NextAuthSession from "./NextAuthSession";
import ClientWrapper from './ClientWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="">
        <NextAuthSession>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
          {/* <ClientWrapper /> */}
        </NextAuthSession>
      </body>
    </html>
  );
}
