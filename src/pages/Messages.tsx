import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MoreVertical, BadgeCheck, Image as ImageIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import KYCBadge from '@/components/auth/KYCBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/constants';
import type { Conversation, Message } from '@/types';

// Mock conversations for demo
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    otherUser: { id: 'u1', full_name: 'Parfait Mbemba', kyc_level: 2, kyc_status: 'approved' },
    listing: { id: '1', title: 'Appartement 3 pièces meublé — Bacongo', cover_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=80&h=80&fit=crop', price: 350000 },
    lastMessage: 'Bonjour, l\'appartement est-il toujours disponible ?',
    lastMessageAt: 'Il y a 2h',
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    otherUser: { id: 'u2', full_name: 'Auto Congo SARL', kyc_level: 2, kyc_status: 'approved' },
    listing: { id: '2', title: 'Toyota RAV4 2019', cover_image: 'https://images.unsplash.com/photo-1568844293986-8d0400f95e1d?w=80&h=80&fit=crop', price: 12500000 },
    lastMessage: 'Le prix est ferme, mais nous offrons la livraison gratuite.',
    lastMessageAt: 'Hier',
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    otherUser: { id: 'u3', full_name: 'Carine Moukoko', kyc_level: 0, kyc_status: 'none' },
    listing: { id: '7', title: 'Robe de soirée wax — Taille M', cover_image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=80&h=80&fit=crop', price: 25000 },
    lastMessage: 'Je peux venir voir la robe demain ?',
    lastMessageAt: 'Lun.',
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    { id: 'm1', conversation_id: 'conv-1', sender_id: 'u1', receiver_id: 'me', listing_id: '1', content: 'Bonjour ! Votre appartement à Bacongo m\'intéresse beaucoup.', is_read: true, created_at: '10:30' },
    { id: 'm2', conversation_id: 'conv-1', sender_id: 'me', receiver_id: 'u1', listing_id: '1', content: 'Bonjour Parfait ! Oui, il est encore disponible.', is_read: true, created_at: '10:32' },
    { id: 'm3', conversation_id: 'conv-1', sender_id: 'u1', receiver_id: 'me', listing_id: '1', content: 'Est-ce que le prix est négociable ?', is_read: true, created_at: '10:35' },
    { id: 'm4', conversation_id: 'conv-1', sender_id: 'me', receiver_id: 'u1', listing_id: '1', content: 'Un peu oui, on peut en discuter lors de la visite.', is_read: true, created_at: '10:36' },
    { id: 'm5', conversation_id: 'conv-1', sender_id: 'u1', receiver_id: 'me', listing_id: '1', content: 'Bonjour, l\'appartement est-il toujours disponible ?', is_read: false, created_at: '14:20' },
  ],
  'conv-2': [
    { id: 'm6', conversation_id: 'conv-2', sender_id: 'me', receiver_id: 'u2', listing_id: '2', content: 'Bonjour, le RAV4 est disponible pour un essai ?', is_read: true, created_at: 'Hier 09:00' },
    { id: 'm7', conversation_id: 'conv-2', sender_id: 'u2', receiver_id: 'me', listing_id: '2', content: 'Le prix est ferme, mais nous offrons la livraison gratuite.', is_read: true, created_at: 'Hier 09:15' },
  ],
};

const Messages = () => {
  const { user, profile, setShowLoginModal } = useAuthStore();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const activeConv = MOCK_CONVERSATIONS.find((c) => c.id === selectedConv);

  useEffect(() => {
    if (selectedConv) {
      setMessages(MOCK_MESSAGES[selectedConv] || []);
    }
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any;
        if (msg.conversation_id === selectedConv) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedConv]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      conversation_id: selectedConv || '',
      sender_id: 'me',
      receiver_id: activeConv?.otherUser.id || '',
      content: newMessage.trim(),
      is_read: false,
      created_at: 'À l\'instant',
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center max-w-lg">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Vos messages</h1>
          <p className="text-14 text-text-muted mb-6">Connectez-vous pour accéder à vos conversations.</p>
          <Button variant="default" size="lg" onClick={() => setShowLoginModal(true)}>Se connecter</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper hideFooter>
      <div className="container mx-auto h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex">
        {/* Conversation list */}
        <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] border-r border-border bg-surface`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-18 font-heading font-semibold text-foreground">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-14 text-text-muted">Vous n'avez pas encore de messages. Contactez un vendeur pour démarrer une conversation.</p>
              </div>
            ) : (
              MOCK_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`w-full p-4 flex gap-3 text-left border-b border-border transition-colors hover:bg-background ${selectedConv === conv.id ? 'bg-primary-light' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-14 flex-shrink-0">
                    {conv.otherUser.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-14 font-medium text-foreground">{conv.otherUser.full_name}</span>
                        {conv.otherUser.kyc_level >= 2 && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <span className="text-11 text-text-muted">{conv.lastMessageAt}</span>
                    </div>
                    {conv.listing && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <img src={conv.listing.cover_image} alt="" className="w-5 h-5 rounded object-cover" />
                        <span className="text-11 text-text-muted truncate">{conv.listing.title}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-12 text-text-secondary truncate flex-1">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground text-11 font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className={`${selectedConv ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-background`}>
          {activeConv ? (
            <>
              {/* Thread header */}
              <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConv(null)}
                  className="md:hidden p-1 text-text-secondary"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-14">
                  {activeConv.otherUser.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-14 font-semibold text-foreground">{activeConv.otherUser.full_name}</span>
                    {activeConv.otherUser.kyc_level >= 2 && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <KYCBadge level={activeConv.otherUser.kyc_level} status={activeConv.otherUser.kyc_status as any} />
                </div>
                <div className="relative">
                  <button onClick={() => setOptionsOpen(!optionsOpen)} className="p-1.5 text-text-secondary hover:text-foreground transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {optionsOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-card shadow-md z-10 min-w-[140px]">
                      <button className="w-full text-left px-4 py-2 text-14 text-text-secondary hover:bg-background transition-colors">Bloquer</button>
                      <button className="w-full text-left px-4 py-2 text-14 text-danger hover:bg-danger-light transition-colors">Signaler</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Listing card compact */}
              {activeConv.listing && (
                <div className="bg-surface border-b border-border px-4 py-2 flex items-center gap-3">
                  <img src={activeConv.listing.cover_image} alt="" className="w-12 h-12 rounded-input object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-12 font-medium text-foreground truncate">{activeConv.listing.title}</p>
                    {activeConv.listing.price && (
                      <p className="text-12 text-primary font-heading font-bold">{formatPrice(activeConv.listing.price)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === 'me';
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-card ${isMine ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border text-foreground'}`}>
                        <p className="text-14">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                          <span className={`text-11 ${isMine ? 'text-primary-foreground/70' : 'text-text-muted'}`}>
                            {msg.created_at}
                          </span>
                          {isMine && (
                            <span className={`text-11 ${msg.is_read ? 'text-primary-foreground' : 'text-primary-foreground/50'}`}>
                              {msg.is_read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="bg-surface border-t border-border p-3 flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Votre message..."
                  className="rounded-pill flex-1"
                />
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="rounded-full w-10 h-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-14 text-text-muted">Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Messages;
