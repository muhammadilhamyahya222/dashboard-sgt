import type { Metadata } from "next";
import localFont from "next/font/local";
import { App } from "antd";
import "./globals.css";
import StyledComponentsRegistry from "./AntdRegistry";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Product Dashboard",
    description: "Technical Test for Summit Global Teknologi",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <StyledComponentsRegistry>
                    <App>{children}</App>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}
