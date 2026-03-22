import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Send, Check, Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  project_interest: z.string().max(200).optional(),
  message: z.string().trim().min(10, 'Mensagem muito curta').max(1000),
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', project_interest: '', message: '' },
  });

  const onSubmit = async (data: FormData) => {
    setStatus('sending');
    try {
      const { error } = await supabase.from('contact_submissions').insert([{
        name: data.name,
        email: data.email,
        project_interest: data.project_interest || null,
        message: data.message,
        source: 'form',
        metadata: {
          page: window.location.pathname,
          referrer: document.referrer || null,
          timestamp: new Date().toISOString(),
        },
      }]);
      if (error) throw error;
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-foreground font-body">Mensagem enviada com sucesso!</p>
        <p className="text-xs text-muted-foreground font-body">Retornarei em breve.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-4 text-left">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Seu nome"
                    className="bg-secondary/50 border-border text-sm font-body"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Seu email"
                    className="bg-secondary/50 border-border text-sm font-body"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="project_interest"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Tipo de projeto (ex: Comercial, Documentário)"
                  className="bg-secondary/50 border-border text-sm font-body"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Conte brevemente sobre seu projeto..."
                  rows={3}
                  className="bg-secondary/50 border-border text-sm font-body resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === 'error' && (
          <p className="text-xs text-destructive font-body">Erro ao enviar. Tente novamente.</p>
        )}

        <Button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-sm text-xs tracking-[0.15em] uppercase"
        >
          {status === 'sending' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Enviar mensagem
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
