import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Send, Check } from 'lucide-react';

const WHATSAPP_NUMBER = '5512991751413';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  project_interest: z.string().max(200).optional(),
  message: z.string().trim().min(10, 'Mensagem muito curta').max(1000),
});

type FormData = z.infer<typeof formSchema>;

function buildWhatsAppUrl(data: FormData): string {
  const lines = [
    `Olá, meu nome é ${data.name}!`,
    data.email,
    ``,
    data.project_interest ? `Tipo de projeto: ${data.project_interest}` : '',
    data.message,
  ].filter(Boolean).join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
}

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', project_interest: '', message: '' },
  });

  const onSubmit = (data: FormData) => {
    const url = buildWhatsAppUrl(data);
    window.open(url, '_blank');
    setSent(true);
    form.reset();
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 border border-accent/30">
          <Check className="h-5 w-5 text-accent" />
        </div>
        <p className="text-sm text-foreground font-body">Mensagem aberta no WhatsApp!</p>
        <p className="text-xs text-muted-foreground font-body">Conclua o envio diretamente por lá.</p>
        <Button
          variant="outline"
          onClick={() => setSent(false)}
          className="mt-2 rounded-full text-xs tracking-[0.15em] uppercase"
        >
          Enviar outra mensagem
        </Button>
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

        <Button
          type="submit"
          className="w-full rounded-full text-xs tracking-[0.15em] uppercase bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Send className="h-3.5 w-3.5" />
          Enviar mensagem
        </Button>
      </form>
    </Form>
  );
}
