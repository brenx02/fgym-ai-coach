// ⚠️ TEMPORÁRIO: Proteção de rotas desativada para facilitar testes.
// Para reativar, restaure a versão anterior que usa useAuth + Navigate("/auth").
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
