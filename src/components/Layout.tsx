import Header from "~/components/Header";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <Header />
      <div className="flex min-h-screen flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
