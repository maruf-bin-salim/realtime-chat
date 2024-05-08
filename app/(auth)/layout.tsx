export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center w-screen mx-auto bg-[#161B22]">
      {children}
    </div>
  );
}
