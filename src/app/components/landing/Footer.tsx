'use client';

export default function Footer() {
  return (
    <footer className="bg-white py-12 text-textSecondary">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-heading text-primary mb-2">Celebra</h4>
          <p className="text-sm">© 2025 Celebra. Todos os direitos reservados.</p>
        </div>
        <div>
          <h5 className="font-medium mb-2">Soluções</h5>
          <ul className="text-sm space-y-1">
            <li><a href="#">Desenvolvimento</a></li>
            <li><a href="#">Automação</a></li>
            <li><a href="#">Integração</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-medium mb-2">Empresa</h5>
          <ul className="text-sm space-y-1">
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Portfólio</a></li>
            <li><a href="#">Contato</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-medium mb-2">Newsletter</h5>
          <form className="flex flex-col sm:flex-row gap-2">
            <input type="email" placeholder="Seu e-mail" className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition">Inscrever</button>
          </form>
        </div>
      </div>
    </footer>
  );
}