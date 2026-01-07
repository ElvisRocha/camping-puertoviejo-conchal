import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WHATSAPP_NUMBER = '50688888888'; // Replace with actual number
const WHATSAPP_MESSAGE = 'Hello! I have a question about Camping Puerto Viejo Conchal.';

export function ContactInfo() {
  const { t } = useTranslation();

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const contactItems = [
    {
      icon: MapPin,
      title: t('contact.info.address'),
      content: 'Mapatalo, Puerto Viejo, Guanacaste Province, Cabo Velas District, 50308, Costa Rica',
      link: 'https://www.google.com/maps/dir/?api=1&destination=10.4066,-85.8012',
    },
    {
      icon: Phone,
      title: t('contact.info.phone'),
      content: '+506 8888-8888',
      link: 'tel:+50688888888',
    },
    {
      icon: Mail,
      title: t('contact.info.email'),
      content: 'hello@campingpuertoviejoconchal.com',
      link: 'mailto:hello@campingpuertoviejoconchal.com',
    },
    {
      icon: Clock,
      title: t('contact.info.hours'),
      content: t('contact.info.hoursContent'),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Contact items */}
      <div className="space-y-4 flex-grow">
        {contactItems.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              {item.link ? (
                <a
                  href={item.link}
                  target={item.link.startsWith('http') ? '_blank' : undefined}
                  rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.content}
                </a>
              ) : (
                <p className="text-muted-foreground">{item.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp button */}
      <div className="pt-4 border-t mt-auto">
        <p className="text-sm text-muted-foreground mb-3">
          {t('contact.whatsapp.description')}
        </p>
        <Button
          onClick={handleWhatsAppClick}
          className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          {t('contact.whatsapp.button')}
        </Button>
      </div>
    </div>
  );
}
