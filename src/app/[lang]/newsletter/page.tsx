'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle, Bell, Waves, BookOpen, Sparkles } from 'lucide-react';
import { detectLangFromPath, t } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

interface NewsletterPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default function NewsletterPage({ params }: NewsletterPageProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const pathname = usePathname();
  const currentLang = detectLangFromPath(pathname);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage(t(currentLang, 'pleaseEnterEmail'));
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, language: currentLang }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t(currentLang, 'subscriptionSuccess'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || t(currentLang, 'subscriptionError'));
      }
    } catch (error) {
      setStatus('error');
      setMessage(t(currentLang, 'networkError'));
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-primary/5 ${currentLang === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-secondary/15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-20 h-20 rounded-full bg-primary/8 blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Bell className="h-4 w-4" />
              {t(currentLang, 'newsletterSubscription')}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-glow-primary mb-6">
              {t(currentLang, 'stayConnectedWithOcean')}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t(currentLang, 'subscribeDescription')}
            </p>
          </div>

          {/* Newsletter Signup Form */}
          <Card className="glass-card max-w-md mx-auto mb-12">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t(currentLang, 'getLatestArticles')}
              </CardTitle>
              <CardDescription>
                {t(currentLang, 'beFirstToKnow')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={t(currentLang, 'enterEmailAddress')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full"
                    dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                
                {status === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {message}
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {message}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full ripple-effect"
                  disabled={status === 'loading' || status === 'success'}
                >
                  {status === 'loading' ? t(currentLang, 'subscribing') : 
                   status === 'success' ? t(currentLang, 'subscribed') : 
                   t(currentLang, 'subscribeToNewsletter')}
                </Button>
              </form>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                {t(currentLang, 'privacyNotice')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-glow-primary mb-4">
              {t(currentLang, 'whatYouReceive')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(currentLang, 'joinThousands')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card hover:border-primary/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Waves className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-heading text-glow-primary">
                  {t(currentLang, 'oceanDiscoveries')}
                </CardTitle>
                <CardDescription>
                  {t(currentLang, 'oceanDiscoveriesDesc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card hover:border-primary/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl font-heading text-glow-primary">
                  {t(currentLang, 'researchArticles')}
                </CardTitle>
                <CardDescription>
                  {t(currentLang, 'researchArticlesDesc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card hover:border-primary/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-heading text-glow-primary">
                  {t(currentLang, 'exclusiveContent')}
                </CardTitle>
                <CardDescription>
                  {t(currentLang, 'exclusiveContentDesc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">1000+</div>
              <div className="text-muted-foreground">{t(currentLang, 'oceanEnthusiasts')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">{t(currentLang, 'weekly')}</div>
              <div className="text-muted-foreground">{t(currentLang, 'newArticles')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">7 {t(currentLang, 'days')}</div>
              <div className="text-muted-foreground">{t(currentLang, 'earlyAccess')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
