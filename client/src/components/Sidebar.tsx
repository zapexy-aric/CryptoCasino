import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  setDepositModalOpen: (open: boolean) => void;
  setWithdrawModalOpen: (open: boolean) => void;
  isAuthenticated: boolean;
}

export default function Sidebar({ isOpen, setDepositModalOpen, setWithdrawModalOpen, isAuthenticated }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40 sidebar-transition lg:translate-x-0 ${isOpen ? '' : 'mobile-sidebar-hidden'}`}>
      <div className="p-4">
        <nav className="space-y-2">
          <Link href="/">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'} transition-colors`} data-testid="link-home">
              <i className="fas fa-home text-sm"></i>
              <span className="font-medium">Home</span>
            </a>
          </Link>
          
          <Link href="/mines">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === '/mines' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'} transition-colors`} data-testid="link-mines">
              <i className="fas fa-bomb text-sm"></i>
              <span>Mines</span>
            </a>
          </Link>
          
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" data-testid="link-bc-originals">
            <i className="fas fa-dice text-sm"></i>
            <span>BC Originals</span>
          </a>
          
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" data-testid="link-slots">
            <i className="fas fa-slot-machine text-sm"></i>
            <span>Slots</span>
          </a>
          
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" data-testid="link-live-casino">
            <i className="fas fa-users text-sm"></i>
            <span>Live Casino</span>
          </a>
          
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" data-testid="link-sports">
            <i className="fas fa-football-ball text-sm"></i>
            <span>Sports</span>
          </a>
          
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" data-testid="link-lottery">
            <i className="fas fa-ticket-alt text-sm"></i>
            <span>Lottery</span>
          </a>
          
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" data-testid="link-racing">
            <i className="fas fa-car text-sm"></i>
            <span>Racing</span>
          </a>
          
          {isAuthenticated && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-3">ACCOUNT</p>
              <button 
                onClick={() => setDepositModalOpen(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                data-testid="button-deposit"
              >
                <i className="fas fa-plus-circle text-sm"></i>
                <span>Deposit</span>
              </button>
              <button 
                onClick={() => setWithdrawModalOpen(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                data-testid="button-withdraw"
              >
                <i className="fas fa-minus-circle text-sm"></i>
                <span>Withdraw</span>
              </button>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" data-testid="link-statistics">
                <i className="fas fa-chart-line text-sm"></i>
                <span>Statistics</span>
              </a>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
