import { User } from "@shared/schema";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  user?: User;
}

export default function Header({ sidebarOpen, setSidebarOpen, isAuthenticated, user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-foreground hover:text-primary transition-colors"
            data-testid="button-sidebar-toggle"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <i className="fas fa-gamepad text-white text-lg"></i>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CryptoPlay
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
              <i className="fas fa-wallet text-accent"></i>
              <span className="text-sm font-medium" data-testid="text-balance">${user.balance}</span>
              <span className="text-xs text-muted-foreground">USDT</span>
            </div>
          )}
          
          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => window.location.href = "/api/login"}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                data-testid="button-login"
              >
                Login
              </button>
              <button 
                onClick={() => window.location.href = "/api/login"}
                className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity glow-effect"
                data-testid="button-signup"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="img-avatar"
                />
              )}
              <span className="text-sm font-medium" data-testid="text-username">
                {user?.firstName || 'Player'}
              </span>
              <button 
                onClick={() => window.location.href = "/api/logout"}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
