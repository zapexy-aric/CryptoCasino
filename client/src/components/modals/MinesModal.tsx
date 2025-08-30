import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface MinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MinesModal({ isOpen, onClose }: MinesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-destructive to-red-600 rounded-xl flex items-center justify-center">
            <i className="fas fa-bomb text-white text-3xl"></i>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-2">Mines Game</h3>
            <p className="text-muted-foreground">
              Find hidden gems while avoiding dangerous mines. The more gems you find, the higher your multiplier!
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/mines">
              <Button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 text-lg font-bold"
                data-testid="button-play-mines"
              >
                Play Mines
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
              data-testid="button-close-mines-modal"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
