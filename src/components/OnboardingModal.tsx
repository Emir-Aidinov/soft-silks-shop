import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, Heart, ShoppingCart, Gift, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'bescenki_onboarding_completed';

const steps = [
  {
    icon: Sparkles,
    title: 'Добро пожаловать в Бесценки!',
    description: 'Рады приветствовать вас в нашем магазине женского белья. Давайте познакомимся с основными функциями сайта.',
  },
  {
    icon: Search,
    title: 'Удобный поиск',
    description: 'Используйте поиск в каталоге для быстрого нахождения нужных товаров. Фильтруйте по категориям, цветам и размерам.',
  },
  {
    icon: Heart,
    title: 'Избранное',
    description: 'Нажмите на сердечко, чтобы добавить товар в избранное. Все понравившиеся товары будут сохранены для вас.',
  },
  {
    icon: ShoppingCart,
    title: 'Простое оформление',
    description: 'Добавляйте товары в корзину и оформляйте заказ в несколько кликов. Доступна оплата онлайн или при получении.',
  },
  {
    icon: Gift,
    title: 'Приглашайте друзей',
    description: 'Получайте бонусы за приглашённых друзей! Перейдите в профиль и поделитесь своей реферальной ссылкой.',
  },
];

export const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Пропустить
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {currentStep < steps.length - 1 ? 'Далее' : 'Начать покупки'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
