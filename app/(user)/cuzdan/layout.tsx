// 🚀 Klasör adın "User" olduğu için importu böyle mühürle:
import UserSidebar from "@/components/User/UserSidebar";

export default function CuzdanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Yan Menü */}
      <UserSidebar /> 
      
      {/* Ana İçerik Alanı */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}