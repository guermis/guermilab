import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Validações do formulário
const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  projectType: z.string().min(2, { message: 'Por favor, informe o tipo de projeto.' }),
  message: z.string().min(10, { message: 'A mensagem deve ter pelo menos 10 caracteres.' }),
});

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      projectType: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Pegando os valores reais que o usuário digitou
    const text = `Olá, meu nome é ${values.name}!\n${values.email}\nTipo de projeto: ${values.projectType}\n${values.message}`;
    const encodedText = encodeURIComponent(text);
    
    // Tenta usar o Deep Link nativo primeiro (excelente para celular)
    const deepLink = `whatsapp://send?phone=5512991751413&text=${encodedText}`;
    
    // Se for computador, vai direto para o WhatsApp Web (sem passar pela API bugada da Meta)
    const webLink = `https://web.whatsapp.com/send?phone=5512991751413&text=${encodedText}`;

    // Detecta se é mobile (celular/tablet) para escolher a melhor rota
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const finalUrl = isMobile ? deepLink : webLink;
    
    // Abre a janela imediatamente (Driblando Opera GX/Brave)
    window.open(finalUrl, '_blank');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left w-full">
        
        {/* Grid para Nome e Email ficarem lado a lado no PC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" className="bg-background" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="exemplo@email.com" type="email" className="bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Campo de Digitar Livre para Tipo de Projeto (Substituiu a Lista) */}
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Projeto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Vídeo Musical, Edição, Filme Corporativo..." className="bg-background" {...field} />
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
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conte um pouco mais sobre sua ideia ou projeto..."
                  className="min-h-[150px] resize-none bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" className="w-full md:w-auto px-8">
            Enviar Mensagem
          </Button>
        </div>

      </form>
    </Form>
  );
}
