export default function FooterLanding() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-100 text-center py-4 mt-10 text-sm text-gray-800 dark:text-gray-800 border-t border-gray-200 dark:border-gray-200">
      <p>
        &copy; {new Date().getFullYear()} <strong>SIMADU <span className="text-emerald-500">Sistem Informasi Manajemen Posyandu</span></strong> — All Rigth Reserved <span className="text-blue-500 font-semibold"><a href="https://amadsgit.github.io/mamad-ahmad-portofolio/" target="_blank">by : M Ahmad</a></span>
      </p>
    </footer>
  );
}
