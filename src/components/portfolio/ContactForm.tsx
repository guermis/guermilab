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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  projectType: z.string().min(1, { message: 'Selecione um tipo de projeto.' }),
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
    // Formata a mensagem com as quebras de linha corretas
    const text = `Olá, meu nome é ${values.name}!\n${values.email}\nTipo de projeto: ${values.projectType}\n${values.message}`;
    const encodedText = encodeURIComponent(text);
    
    // Tenta usar o Deep Link nativo primeiro (excelente para celular)
    const deepLink = `whatsapp://send?phone=5512991751413&text=${encodedText}`;
    
    // Se for computador, vai direto para o WhatsApp Web (sem passar pela API bugada da Meta)
    const webLink = `https://web.whatsapp.com/send?phone=5512991751413&text=${encodedText}`;

    // Detecta se é mobile (celular/tablet) para escolher a melhor rota
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const finalUrl = isMobile ? deepLink : webLink;
    
    // Abre a janela imediatamente
    window.open(finalUrl, '_blank');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
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
                <Input placeholder="exemplo@email.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Projeto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de projeto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Video Musical">Vídeo Musical</SelectItem>
                  <SelectItem value="Video Corporativo">Vídeo Corporativo</SelectItem>
                  <SelectItem value="Fotografia">Fotografia</SelectItem>
                  <SelectItem value="Edicao">Edição</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Descreva brevemente sobre o projeto..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Enviar Mensagem
        </Button>
      </form>
    </Form>
  );
}
