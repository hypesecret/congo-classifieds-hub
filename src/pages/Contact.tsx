import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Shield } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      toast.success('Message envoyé !', {
        description: "L'équipe Expat-Congo vous répondra dans les plus brefs délais."
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-32 md:text-40 font-bold text-foreground font-heading mb-4">Contactez-nous</h1>
          <p className="text-16 text-text-secondary max-w-2xl mx-auto">
            Une question sur une annonce ? Un problème technique ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-14 text-text-secondary">Téléphone</p>
                    <p className="text-18 font-bold text-foreground">+242 06 000 00 00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-14 text-text-secondary">Email</p>
                    <p className="text-18 font-bold text-foreground">support@expat-congo.cg</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-14 text-text-secondary">Bureaux</p>
                    <p className="text-18 font-bold text-foreground">Brazzaville, Centre-ville</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-surface rounded-card border border-border p-6">
              <h3 className="font-bold text-16 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Sécurité & Confiance
              </h3>
              <ul className="space-y-3 text-14 text-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Assistance gratuite pour signaler une fraude
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Temps de réponse moyen : moins de 24h
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Bureaux physiques à Brazzaville et Pointe-Noire
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-14 font-medium text-text-secondary">Nom complet</label>
                      <Input placeholder="Ex: Jean Mukoko" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-14 font-medium text-text-secondary">Adresse Email</label>
                      <Input type="email" placeholder="votre@email.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-14 font-medium text-text-secondary">Sujet</label>
                    <Input placeholder="De quoi s'agit-il ?" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-14 font-medium text-text-secondary">Message</label>
                    <Textarea placeholder="Détaillez votre demande ici..." className="min-h-[150px] resize-none" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full h-12 text-16 gap-2" disabled={loading}>
                    {loading ? 'Envoi...' : <><Send className="w-5 h-5" /> Envoyer le message</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;
