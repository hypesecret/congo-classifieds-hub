import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, BadgeCheck, MessageSquare } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import KYCBadge from '@/components/auth/KYCBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/constants';
import { useConversations, useConversationMessages, useSendMessage } from '@/hooks/useMessages';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedConvId = searchParams.get('id');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const { data: conversations, isLoading: loadingConvs, refetch: refetchConvs } = useConversations();
  const { data: messages, isLoading: loadingMsgs } = useConversationMessages(selectedConvId);
  const { mutate: sendMessage, isPending: sending } = useSendMessage();

  const activeConv = conversations?.find((c: any) => c.id === selectedConvId) as any;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        refetchConvs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedConvId, refetchConvs]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConv) return;
    
    const listing = activeConv.listing;
    const listingObj = Array.isArray(listing) ? listing[0] : listing;
    
    sendMessage({
      listingId: listingObj?.id || activeConv.listing_id,
      receiverId: activeConv.otherUser?.id,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  const setSelectedConv = (id: string | null) => {
    if (id) {
      setSearchParams({ id });
    } else {
      setSearchParams({});
    }
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="container mx-auto py-16 text-center max-w-lg">
          <h1 className="text-24 font-heading font-bold text-foreground mb-4">Vos messages</h1>
          <p className="text-14 text-text-muted mb-6">Connectez-vous pour accéder à vos conversations.</p>
          <Button variant="default" size="lg" onClick={() => navigate('/login')}>Se connecter</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper hideFooter>
      <div className="container mx-auto h-[calc(100vh-64px)] flex">
        {/* Conversation list */}
        <div className={`${selectedConvId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] border-r border-border bg-surface shadow-sm`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-18 font-heading font-semibold text-foreground">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-background rounded animate-pulse" />)}
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-14 text-text-muted leading-relaxed">
                  Vous n'avez pas encore de messages.<br />
                  Contactez un vendeur pour démarrer une conversation.
                </p>
              </div>
            ) : (
              conversations.map((conv: any) => {
                const otherUser = conv.otherUser || {};
                const listing = Array.isArray(conv.listing) ? conv.listing[0] : conv.listing;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`w-full p-4 flex gap-3 text-left border-b border-border transition-colors hover:bg-background ${selectedConvId === conv.id ? 'bg-primary-light' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-14 flex-shrink-0 overflow-hidden">
                      {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        otherUser.full_name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-14 font-medium text-foreground truncate">{otherUser.full_name}</span>
                          {(otherUser.kyc_level ?? 0) >= 2 && <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        </div>
                        <span className="text-11 text-text-muted flex-shrink-0">
                          {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      {listing && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {listing.cover_image && <img src={listing.cover_image} alt="" className="w-5 h-5 rounded object-cover" />}
                          <span className="text-11 text-text-muted truncate">{listing.title}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-12 text-text-secondary truncate flex-1">{conv.last_message}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className={`${selectedConvId ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-background`}>
          {selectedConvId && activeConv ? (() => {
            const otherUser = activeConv.otherUser || {};
            const listing = Array.isArray(activeConv.listing) ? activeConv.listing[0] : activeConv.listing;
            return (
              <>
                {/* Thread header */}
                <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 shadow-xs">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1 text-text-secondary"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-14 overflow-hidden">
                    {otherUser.avatar_url ? (
                      <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      otherUser.full_name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-14 font-semibold text-foreground">{otherUser.full_name}</span>
                      {(otherUser.kyc_level ?? 0) >= 2 && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <KYCBadge level={otherUser.kyc_level ?? 0} status={otherUser.kyc_status ?? 'none'} />
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
                {listing && (
                  <Link to={`/annonce/${listing.id}`} className="bg-surface border-b border-border px-4 py-2 flex items-center gap-3 hover:bg-background transition-colors">
                    {listing.cover_image && <img src={listing.cover_image} alt="" className="w-12 h-12 rounded-input object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-12 font-medium text-foreground truncate">{listing.title}</p>
                      {listing.price && (
                        <p className="text-12 text-primary font-heading font-bold">{formatPrice(listing.price)}</p>
                      )}
                    </div>
                  </Link>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="space-y-3">
                      <div className="h-10 w-1/3 bg-surface rounded" />
                      <div className="h-10 w-1/2 bg-surface rounded ml-auto" />
                    </div>
                  ) : messages?.map((msg: any) => {
                    const isMine = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 rounded-card shadow-xs ${isMine ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border text-foreground'}`}>
                          <p className="text-14 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1.5 ${isMine ? 'justify-end' : ''}`}>
                            <span className={`text-10 ${isMine ? 'text-primary-foreground/70' : 'text-text-muted'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && (
                              <span className={`text-10 font-bold ${msg.is_read ? 'text-primary-foreground' : 'text-primary-foreground/50'}`}>
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
                    placeholder="Écrivez votre message..."
                    className="rounded-pill flex-1 bg-background"
                    disabled={sending}
                  />
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="rounded-full w-10 h-10 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            );
          })() : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-14">Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Messages;
